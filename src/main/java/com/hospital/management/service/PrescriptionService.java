package com.hospital.management.service;

import com.hospital.management.dto.PrescriptionRequest;
import com.hospital.management.entity.*;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.repository.PrescriptionRepository;
import com.hospital.management.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final SmsService smsService;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            SmsService smsService) {

        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.smsService = smsService;
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public List<Prescription> getPrescriptionsForUser(CustomUserDetails userDetails) {
        if (userDetails == null) {
            return List.of();
        }
        Role role = userDetails.getUser().getRole();
        if (role == Role.ADMIN) {
            return prescriptionRepository.findAll();
        } else if (role == Role.DOCTOR) {
            Long doctorId = userDetails.getDoctorId();
            return doctorId != null ? prescriptionRepository.findByDoctor_Id(doctorId) : List.of();
        } else if (role == Role.PATIENT) {
            Long patientId = userDetails.getPatientId();
            return patientId != null ? prescriptionRepository.findByPatient_Id(patientId) : List.of();
        }
        return List.of();
    }

    public Prescription createPrescription(PrescriptionRequest request, CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getUser().getRole() == Role.DOCTOR) {
            if (userDetails.getDoctorId() == null || !userDetails.getDoctorId().equals(request.getDoctorId())) {
                throw new AccessDeniedException("Doctors can only issue prescriptions under their own ID.");
            }
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        Optional<Appointment> completedAppointment =
                appointmentRepository.findByPatient_IdAndDoctor_IdAndStatus(
                        patient.getId(),
                        doctor.getId(),
                        "Completed"
                );

        if (completedAppointment.isEmpty() && (userDetails == null || userDetails.getUser().getRole() != Role.ADMIN)) {
            throw new AccessDeniedException("Doctor does not have a completed appointment with this patient.");
        }

        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setNotes(request.getNotes());
        prescription.setCreatedAt(LocalDateTime.now());

        if (request.getMedicines() != null) {
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
        }

        Prescription saved = prescriptionRepository.save(prescription);

        // Send SMS notification with medicines and notes
        smsService.sendPrescriptionSms(patient, doctor, saved.getMedicines(), saved.getNotes());

        return saved;
    }
}
