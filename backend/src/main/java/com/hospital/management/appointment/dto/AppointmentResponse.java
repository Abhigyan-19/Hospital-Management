package com.hospital.management.appointment.dto;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        PatientSummary patient,
        DoctorSummary doctor,
        String date,
        String time,
        String status,
        int durationMinutes,
        LocalDateTime checkedInAt,
        String reason) {

    public record PatientSummary(Long id, String name) {
    }

    public record DoctorSummary(
            Long id,
            String name,
            String specialization,
            boolean availabilityConfigured,
            String startTime,
            String endTime,
            int slotMinutes,
            java.util.List<String> workingDays,
            java.util.List<String> leaveDates) {
    }
}
