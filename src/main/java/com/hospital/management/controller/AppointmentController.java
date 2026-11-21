package com.hospital.management.controller;

import com.hospital.management.dto.AppointmentRequest;
import com.hospital.management.dto.RescheduleRequest;
import com.hospital.management.entity.Appointment;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public List<Appointment> getAllAppointments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.getAppointmentsForUser(userDetails);
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public Appointment createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.createAppointment(request, userDetails);
    }

    @PutMapping("/appointments/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public Appointment updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.updateStatus(id, status, userDetails);
    }

    @PatchMapping("/appointments/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public Appointment rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.rescheduleAppointment(id, request.getEffectiveDate(), request.getEffectiveTime(), userDetails);
    }

    // Patient & Clinician dedicated /appointments/me routes
    @GetMapping("/appointments/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public List<Appointment> getMyAppointments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.getAppointmentsForUser(userDetails);
    }

    @PostMapping("/appointments/me")
    @PreAuthorize("hasRole('PATIENT')")
    public Appointment createMyAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getPatientId() != null) {
            request.setPatientId(userDetails.getPatientId());
        }
        return appointmentService.createAppointment(request, userDetails);
    }

    @PutMapping("/appointments/me/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public Appointment updateMyStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.updateStatus(id, status, userDetails);
    }

    @PatchMapping("/appointments/me/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public Appointment rescheduleMyAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.rescheduleAppointment(id, request.getEffectiveDate(), request.getEffectiveTime(), userDetails);
    }
}
