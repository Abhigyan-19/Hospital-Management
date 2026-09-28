package com.hospital.management.service;

import com.hospital.management.dto.AppointmentRequest;
import com.hospital.management.entity.Appointment;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    // Get all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Create appointment
    public Appointment createAppointment(AppointmentRequest request) {

        // Find patient
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        // Find doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        // Check whether the doctor is already booked
        boolean slotBooked =
                appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusNot(
                        request.getDoctorId(),
                        request.getDate(),
                        request.getTime(),
                        "Cancelled"
                );

        if (slotBooked) {
            throw new RuntimeException(
                    "Doctor is already booked for this time slot"
            );
        }

        // New appointments start with Scheduled status
        Appointment appointment = new Appointment(
                patient,
                doctor,
                request.getDate(),
                request.getTime(),
                "Scheduled"
        );

        return appointmentRepository.save(appointment);
    }

    // Update appointment status
    public Appointment updateStatus(Long id, String status) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));

        String normalizedStatus = status.trim().toLowerCase();

        switch (normalizedStatus) {

            case "scheduled":
                appointment.setStatus("Scheduled");
                break;

            case "confirmed":
                appointment.setStatus("Confirmed");
                break;

            case "cancelled":
                appointment.setStatus("Cancelled");
                break;

            case "completed":
                appointment.setStatus("Completed");
                break;

            default:
                throw new RuntimeException(
                        "Invalid appointment status. " +
                                "Allowed values: Scheduled, Confirmed, Cancelled, Completed"
                );
        }

        return appointmentRepository.save(appointment);
    }
}