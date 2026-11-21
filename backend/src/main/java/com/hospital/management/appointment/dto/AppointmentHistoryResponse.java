package com.hospital.management.appointment.dto;

import com.hospital.management.appointment.entity.AppointmentStatusHistory;

import java.time.LocalDateTime;

public record AppointmentHistoryResponse(
        Long id,
        String previousStatus,
        String newStatus,
        String previousDate,
        String previousTime,
        String newDate,
        String newTime,
        String changedBy,
        String reason,
        LocalDateTime changedAt) {

    public static AppointmentHistoryResponse from(AppointmentStatusHistory history) {
        return new AppointmentHistoryResponse(
                history.getId(),
                history.getPreviousStatus() == null ? null : history.getPreviousStatus().name(),
                history.getNewStatus() == null ? null : history.getNewStatus().name(),
                history.getPreviousDate() == null ? null : history.getPreviousDate().toString(),
                history.getPreviousTime() == null ? null : history.getPreviousTime().toString(),
                history.getNewDate() == null ? null : history.getNewDate().toString(),
                history.getNewTime() == null ? null : history.getNewTime().toString(),
                history.getChangedBy() == null ? null : history.getChangedBy().getEmail(),
                history.getReason(),
                history.getChangedAt());
    }
}
