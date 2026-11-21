package com.hospital.management.doctor.dto;

import com.hospital.management.doctor.entity.DoctorAvailability;

import java.time.format.DateTimeFormatter;
import java.util.List;

public record AvailabilityResponse(
        List<String> workingDays,
        String startTime,
        String endTime,
        int slotMinutes,
        List<String> leaveDates) {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    public static AvailabilityResponse from(DoctorAvailability availability) {
        return new AvailabilityResponse(
                availability.getWorkingDays(),
                TIME_FORMAT.format(availability.getStartTime()),
                TIME_FORMAT.format(availability.getEndTime()),
                availability.getSlotMinutes(),
                availability.getLeaveDates());
    }
}
