package com.hospital.management.service;

import com.hospital.management.dto.AppointmentRequest;
import com.hospital.management.entity.Appointment;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.Role;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SmsService smsService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            SmsService smsService) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.smsService = smsService;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsForUser(CustomUserDetails userDetails) {
        if (userDetails == null) {
            return List.of();
        }
        Role role = userDetails.getUser().getRole();
        if (role == Role.ADMIN || role == Role.RECEPTIONIST) {
            return appointmentRepository.findAll();
        } else if (role == Role.DOCTOR) {
            Long doctorId = userDetails.getDoctorId();
            return doctorId != null ? appointmentRepository.findByDoctor_Id(doctorId) : List.of();
        } else if (role == Role.PATIENT) {
            Long patientId = userDetails.getPatientId();
            return patientId != null ? appointmentRepository.findByPatient_Id(patientId) : List.of();
        }
        return List.of();
    }

    public Appointment createAppointment(AppointmentRequest request, CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getUser().getRole() == Role.PATIENT) {
            if (userDetails.getPatientId() == null || !userDetails.getPatientId().equals(request.getPatientId())) {
                throw new AccessDeniedException("Patients can only schedule appointments for themselves.");
            }
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        boolean slotBooked = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusNot(
                request.getDoctorId(),
                request.getDate(),
                request.getTime(),
                "Cancelled"
        );

        if (slotBooked) {
            throw new IllegalArgumentException("Doctor is already booked for this time slot.");
        }

        Appointment appointment = new Appointment(
                patient,
                doctor,
                request.getDate(),
                request.getTime(),
                "Scheduled"
        );

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Dispatch Booking Confirmation SMS to Patient
        smsService.sendAppointmentBookingSms(
                patient,
                doctor,
                savedAppointment.getDate(),
                savedAppointment.getTime()
        );

        return savedAppointment;
    }

    public Appointment updateStatus(Long id, String status, CustomUserDetails userDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (userDetails != null) {
            Role role = userDetails.getUser().getRole();
            if (role == Role.DOCTOR) {
                if (userDetails.getDoctorId() == null || !userDetails.getDoctorId().equals(appointment.getDoctor().getId())) {
                    throw new AccessDeniedException("Doctors can only update their own appointments.");
                }
            } else if (role == Role.PATIENT) {
                if (userDetails.getPatientId() == null || !userDetails.getPatientId().equals(appointment.getPatient().getId())) {
                    throw new AccessDeniedException("Patients can only modify their own appointments.");
                }
                if (!"cancelled".equalsIgnoreCase(status.trim())) {
                    throw new AccessDeniedException("Patients can only cancel their appointments.");
                }
            }
        }

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
                throw new IllegalArgumentException(
                        "Invalid appointment status. Allowed values: Scheduled, Confirmed, Cancelled, Completed"
                );
        }

        Appointment updated = appointmentRepository.save(appointment);

        // If appointment completed, send completion SMS
        if ("completed".equalsIgnoreCase(normalizedStatus)) {
            smsService.sendAppointmentCompletedSms(
                    updated.getPatient(),
                    updated.getDoctor(),
                    updated.getDate()
            );
        }

        return updated;
    }
}
