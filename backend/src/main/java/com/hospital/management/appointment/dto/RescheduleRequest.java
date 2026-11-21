package com.hospital.management.appointment.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record RescheduleRequest(@NotNull LocalDate date, @NotNull LocalTime time) {
}
