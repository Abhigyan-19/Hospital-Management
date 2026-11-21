package com.hospital.management.doctor.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.List;

public record AvailabilityRequest(
        @NotEmpty List<String> workingDays,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull Integer slotMinutes,
        @NotNull List<String> leaveDates) {
}
