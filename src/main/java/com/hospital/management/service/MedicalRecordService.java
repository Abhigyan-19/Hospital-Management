package com.hospital.management.service;

import com.hospital.management.dto.ConsultationRequest;
import com.hospital.management.dto.MedicalRecordRequest;
import com.hospital.management.dto.MedicalRecordResponse;
import com.hospital.management.dto.PatientChartDto;
import com.hospital.management.entity.*;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.*;
import com.hospital.management.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final SmsService smsService;
    private final AuditLogService auditLogService;

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository,
            SmsService smsService,
            AuditLogService auditLogService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.smsService = smsService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request, CustomUserDetails userDetails) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Doctor doctor;
        if (request.getDoctorId() != null) {
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));
        } else if (userDetails != null && userDetails.getDoctorId() != null) {
            doctor = doctorRepository.findById(userDetails.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + userDetails.getDoctorId()));
        } else {
            throw new IllegalArgumentException("Doctor ID must be specified.");
        }

        if (userDetails != null && userDetails.getUser().getRole() == Role.DOCTOR) {
            if (!doctor.getId().equals(userDetails.getDoctorId())) {
                throw new AccessDeniedException("Doctors can only author clinical records under their own name.");
            }
        }

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        MedicalRecord record = new MedicalRecord(
                patient,
                doctor,
                appointment,
                request.getDiagnosis(),
                request.getSymptoms(),
                request.getVitals(),
                request.getNotes()
        );

        MedicalRecord saved = medicalRecordRepository.save(record);

        auditLogService.recordLog(userDetails, "CREATE", "MEDICAL_RECORD", String.valueOf(saved.getId()),
                "Created medical record for patient #" + patient.getId() + " (" + patient.getName() + ") - Diagnosis: " + saved.getDiagnosis());

        return MedicalRecordResponse.fromEntity(saved);
    }

    public List<MedicalRecordResponse> getRecordsByPatient(Long patientId, CustomUserDetails userDetails) {
        validatePatientAccess(patientId, userDetails);
        List<MedicalRecord> records = medicalRecordRepository.findByPatient_IdOrderByCreatedAtDesc(patientId);
        auditLogService.recordLog(userDetails, "READ", "MEDICAL_RECORD", "PATIENT_" + patientId,
                "Read clinical history for patient #" + patientId + " (" + records.size() + " entries)");
        return records.stream().map(MedicalRecordResponse::fromEntity).toList();
    }

    public PatientChartDto getPatientChart(Long patientId, CustomUserDetails userDetails) {
        validatePatientAccess(patientId, userDetails);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        List<Appointment> appointments;
        List<Prescription> prescriptions;

        if (userDetails != null && userDetails.getUser().getRole() == Role.DOCTOR) {
            Long doctorId = userDetails.getDoctorId();
            appointments = doctorId != null ? appointmentRepository.findByDoctor_Id(doctorId).stream()
                    .filter(a -> a.getPatient() != null && patientId.equals(a.getPatient().getId()))
                    .toList() : List.of();
            prescriptions = doctorId != null ? prescriptionRepository.findByDoctor_Id(doctorId).stream()
                    .filter(p -> p.getPatient() != null && patientId.equals(p.getPatient().getId()))
                    .toList() : List.of();
        } else {
            appointments = appointmentRepository.findByPatient_Id(patientId);
            prescriptions = prescriptionRepository.findByPatient_Id(patientId);
        }

        List<MedicalRecordResponse> medicalHistory = medicalRecordRepository.findByPatient_IdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(MedicalRecordResponse::fromEntity)
                .toList();

        auditLogService.recordLog(userDetails, "READ", "PATIENT_CHART", String.valueOf(patientId),
                "Accessed full clinical chart for patient #" + patientId + " (" + patient.getName() + ")");

        return new PatientChartDto(patient, appointments, medicalHistory, prescriptions, List.of());
    }

    @Transactional
    public MedicalRecordResponse recordConsultation(Long appointmentId, ConsultationRequest request, CustomUserDetails userDetails) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (userDetails != null && userDetails.getUser().getRole() == Role.DOCTOR) {
            if (userDetails.getDoctorId() == null || !userDetails.getDoctorId().equals(appointment.getDoctor().getId())) {
                throw new AccessDeniedException("Doctors can only conduct consultations for their own assigned appointments.");
            }
        }

        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        // 1. Save medical record for this consultation
        MedicalRecord record = new MedicalRecord(
                patient,
                doctor,
                appointment,
                request.getDiagnosis(),
                request.getNotes(),
                "", // Vitals
                request.getNotes()
        );
        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // 2. If prescription requested, create prescription and children
        if (request.isCreatePrescription() && request.getMedicines() != null && !request.getMedicines().isEmpty()) {
            Prescription prescription = new Prescription();
            prescription.setPatient(patient);
            prescription.setDoctor(doctor);
            prescription.setNotes(request.getPrescriptionNotes());
            prescription.setCreatedAt(LocalDateTime.now());

            List<PrescriptionMedicine> medicines = request.getMedicines().stream()
                    .map(mReq -> {
                        PrescriptionMedicine medicine = new PrescriptionMedicine();
                        medicine.setName(mReq.getName());
                        medicine.setDosage(mReq.getDosage());
                        medicine.setFrequency(mReq.getFrequency());
                        medicine.setDuration(mReq.getDuration());
                        medicine.setPatientInstructions(mReq.getPatientInstructions());
                        medicine.setPrescription(prescription);
                        return medicine;
                    })
                    .toList();
            prescription.setMedicines(medicines);
            Prescription savedPrescription = prescriptionRepository.save(prescription);

            // Send Prescription SMS (non-blocking)
            smsService.sendPrescriptionSms(patient, doctor, savedPrescription.getMedicines(), savedPrescription.getNotes());
        }

        // 3. Mark appointment as completed
        appointment.setStatus("Completed");
        Appointment completedAppointment = appointmentRepository.save(appointment);

        // 4. Send consultation completed SMS (non-blocking)
        smsService.sendAppointmentCompletedSms(patient, doctor, completedAppointment.getDate());

        // 5. Audit log
        auditLogService.recordLog(userDetails, "CONSULTATION_COMPLETED", "APPOINTMENT", String.valueOf(appointmentId),
                "Consultation completed for patient #" + patient.getId() + " by Dr. " + doctor.getName() + " - Diagnosis: " + request.getDiagnosis());

        return MedicalRecordResponse.fromEntity(savedRecord);
    }

    private void validatePatientAccess(Long patientId, CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Authentication required.");
        }
        Role role = userDetails.getUser().getRole();
        if (role == Role.ADMIN || role == Role.DOCTOR || role == Role.RECEPTIONIST) {
            return;
        }
        if (role == Role.PATIENT) {
            if (userDetails.getPatientId() == null || !userDetails.getPatientId().equals(patientId)) {
                throw new AccessDeniedException("Patients can only view their own clinical records.");
            }
            return;
        }
        throw new AccessDeniedException("Unauthorized to access patient medical records.");
    }
}
