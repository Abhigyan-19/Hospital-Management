package com.hospital.management.service;

import com.hospital.management.dto.PrescriptionRequest;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.Prescription;
import com.hospital.management.entity.PrescriptionMedicine;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.repository.PrescriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {

        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public Prescription createPrescription(PrescriptionRequest request) {

        // Find patient
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Patient not found"
                        )
                );

        // Find doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Doctor not found"
                        )
                );

        /*
         * ============================================================
         * PRESCRIPTION AUTHORIZATION
         * ============================================================
         *
         * A doctor can prescribe medicine to a patient only if
         * the doctor has a completed appointment with that patient.
         */

        Optional<com.hospital.management.entity.Appointment> completedAppointment =
                appointmentRepository.findByPatient_IdAndDoctor_IdAndStatus(
                        patient.getId(),
                        doctor.getId(),
                        "Completed"
                );

        if (completedAppointment.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Doctor does not have a completed appointment with this patient"
            );
        }

        /*
         * ============================================================
         * CREATE PRESCRIPTION
         * ============================================================
         */

        Prescription prescription = new Prescription();

        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setNotes(request.getNotes());
        prescription.setCreatedAt(LocalDateTime.now());

        // Add medicines
        List<PrescriptionMedicine> medicines =
                request.getMedicines()
                        .stream()
                        .map(medicineRequest -> {

                            PrescriptionMedicine medicine =
                                    new PrescriptionMedicine();

                            medicine.setName(medicineRequest.getName());
                            medicine.setDosage(medicineRequest.getDosage());
                            medicine.setFrequency(medicineRequest.getFrequency());
                            medicine.setDuration(medicineRequest.getDuration());

                            medicine.setPrescription(prescription);

                            return medicine;
                        })
                        .toList();

        prescription.setMedicines(medicines);

        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }
}

