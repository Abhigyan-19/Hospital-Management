package com.hospital.management.controller;

import com.hospital.management.entity.SmsNotification;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.SmsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications/sms")
public class SmsNotificationController {

    private final SmsService smsService;

    public SmsNotificationController(SmsService smsService) {
        this.smsService = smsService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SmsNotification> getRecentNotifications() {
        return smsService.getRecentNotifications();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public List<SmsNotification> getNotificationsForPatient(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return smsService.getNotificationsForPatient(patientId);
    }
}
