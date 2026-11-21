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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SmsService smsService;
    private final DoctorAvailabilityService doctorAvailabilityService;
    private final AuditLogService auditLogService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            SmsService smsService,
            DoctorAvailabilityService doctorAvailabilityService,
            AuditLogService auditLogService) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.smsService = smsService;
        this.doctorAvailabilityService = doctorAvailabilityService;
        this.auditLogService = auditLogService;
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

    @Transactional
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

        // Check availability schedule (working hours and leave)
        doctorAvailabilityService.validateDoctorAvailable(request.getDoctorId(), request.getDate(), request.getTime());

        // Block double booking
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

        // Audit log
        auditLogService.recordLog(userDetails, "CREATE", "APPOINTMENT", String.valueOf(savedAppointment.getId()),
                "Booked appointment #" + savedAppointment.getId() + " with Dr. " + doctor.getName() + " on " + savedAppointment.getDate() + " at " + savedAppointment.getTime());

        // Dispatch Booking Confirmation SMS to Patient (non-blocking)
        smsService.sendAppointmentBookingSms(
                patient,
                doctor,
                savedAppointment.getDate(),
                savedAppointment.getTime()
        );

        return savedAppointment;
    }

    @Transactional
    public Appointment rescheduleAppointment(Long appointmentId, String newDate, String newTime, CustomUserDetails userDetails) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (userDetails != null) {
            Role role = userDetails.getUser().getRole();
            if (role == Role.PATIENT) {
                if (userDetails.getPatientId() == null || !userDetails.getPatientId().equals(appointment.getPatient().getId())) {
                    throw new AccessDeniedException("Patients can only reschedule their own appointments.");
                }
            } else if (role == Role.DOCTOR) {
                if (userDetails.getDoctorId() == null || !userDetails.getDoctorId().equals(appointment.getDoctor().getId())) {
                    throw new AccessDeniedException("Doctors can only reschedule their own appointments.");
                }
            }
        }

        String oldDate = appointment.getDate();
        String oldTime = appointment.getTime();

        // 1. Validate doctor availability for new slot
        doctorAvailabilityService.validateDoctorAvailable(appointment.getDoctor().getId(), newDate, newTime);

        // 2. Block double-booking for the target doctor and slot
        boolean conflict = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusNotAndIdNot(
                appointment.getDoctor().getId(),
                newDate,
                newTime,
                "Cancelled",
                appointmentId
        );

        if (conflict) {
            throw new IllegalArgumentException("Doctor is already booked for the requested slot: " + newDate + " at " + newTime);
        }

        appointment.setDate(newDate);
        appointment.setTime(newTime);
        if ("Cancelled".equalsIgnoreCase(appointment.getStatus())) {
            appointment.setStatus("Scheduled");
        }

        Appointment saved = appointmentRepository.save(appointment);

        // Audit log
        auditLogService.recordLog(userDetails, "RESCHEDULE", "APPOINTMENT", String.valueOf(saved.getId()),
                "Rescheduled appointment #" + saved.getId() + " from " + oldDate + " " + oldTime + " to " + newDate + " " + newTime);

        // Dispatch Reschedule SMS (non-blocking)
        smsService.sendAppointmentRescheduledSms(saved.getPatient(), saved.getDoctor(), oldDate, newDate, newTime);

        return saved;
    }

    @Transactional
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

        // Audit log
        auditLogService.recordLog(userDetails, "STATUS_UPDATE", "APPOINTMENT", String.valueOf(updated.getId()),
                "Updated appointment #" + updated.getId() + " status to " + updated.getStatus());

        // Non-blocking SMS dispatch
        if ("completed".equalsIgnoreCase(normalizedStatus)) {
            smsService.sendAppointmentCompletedSms(
                    updated.getPatient(),
                    updated.getDoctor(),
                    updated.getDate()
            );
        } else if ("cancelled".equalsIgnoreCase(normalizedStatus)) {
            smsService.sendAppointmentCancelledSms(
                    updated.getPatient(),
                    updated.getDoctor(),
                    updated.getDate(),
                    updated.getTime()
            );
        }

        return updated;
    }
}
