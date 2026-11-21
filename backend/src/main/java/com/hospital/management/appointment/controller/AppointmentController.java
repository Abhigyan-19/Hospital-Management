package com.hospital.management.appointment.controller;

import com.hospital.management.appointment.dto.AppointmentHistoryResponse;
import com.hospital.management.appointment.dto.AppointmentRequest;
import com.hospital.management.appointment.dto.AppointmentResponse;
import com.hospital.management.appointment.dto.RescheduleRequest;
import com.hospital.management.appointment.service.AppointmentService;
import com.hospital.management.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<AppointmentResponse> getAllAppointments(@AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.listForStaff(user.role());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public List<AppointmentResponse> getMyAppointments(@AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.listMine(user);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public AppointmentResponse createStaffAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.createForStaff(request, user);
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponse createPatientAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.createForPatient(request, user);
    }

    @PutMapping("/me/{id}/status")
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponse cancelMine(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (!"Cancelled".equalsIgnoreCase(status) && !"Canceled".equalsIgnoreCase(status)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Patients may only cancel their appointments.");
        }
        return appointmentService.cancelMine(id, user);
    }

    @PatchMapping("/me/{id}/reschedule")
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponse rescheduleMine(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.rescheduleMine(id, request, user);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public AppointmentResponse updateStaffStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.updateAdminStatus(id, status, user);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("isAuthenticated()")
    public List<AppointmentHistoryResponse> history(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.history(id, user);
    }
}
