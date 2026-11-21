package com.hospital.management.appointment.controller;

import com.hospital.management.appointment.dto.AppointmentResponse;
import com.hospital.management.appointment.dto.RejectAppointmentRequest;
import com.hospital.management.appointment.dto.RescheduleRequest;
import com.hospital.management.appointment.service.AppointmentService;
import com.hospital.management.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reception/appointments")
@PreAuthorize("hasRole('RECEPTIONIST')")
public class ReceptionAppointmentController {
    private final AppointmentService appointmentService;

    public ReceptionAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/{id}/approve")
    public AppointmentResponse approve(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.approve(id, user);
    }

    @PostMapping("/{id}/reject")
    public AppointmentResponse reject(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid RejectAppointmentRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.reject(id, request == null ? null : request.reason(), user);
    }

    @PostMapping("/{id}/check-in")
    public AppointmentResponse checkIn(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.checkIn(id, user);
    }

    @PatchMapping("/{id}/reschedule")
    public AppointmentResponse reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return appointmentService.rescheduleForStaff(id, request, user);
    }
}
