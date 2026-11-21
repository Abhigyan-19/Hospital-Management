package com.hospital.management.notification.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String href,
        LocalDateTime createdAt,
        boolean read) {
}
