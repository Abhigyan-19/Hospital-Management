package com.hospital.management.controller;

import com.hospital.management.entity.SmsNotification;
import com.hospital.management.service.SmsService;
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
    public List<SmsNotification> getRecentNotifications() {
        return smsService.getRecentNotifications();
    }

    @GetMapping("/patient/{patientId}")
    public List<SmsNotification> getNotificationsForPatient(@PathVariable Long patientId) {
        return smsService.getNotificationsForPatient(patientId);
    }
}

