package com.hospital.management.controller;

import com.hospital.management.dto.RescheduleRequest;
import com.hospital.management.entity.Appointment;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.AppointmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reception")
public class ReceptionController {

    private final AppointmentService appointmentService;

    public ReceptionController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/appointments/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Appointment checkIn(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.updateStatus(id, "Confirmed", userDetails);
    }

    @PatchMapping("/appointments/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Appointment reschedule(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.rescheduleAppointment(id, request.getEffectiveDate(), request.getEffectiveTime(), userDetails);
    }
}
