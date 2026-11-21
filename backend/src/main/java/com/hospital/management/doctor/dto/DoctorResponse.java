package com.hospital.management.doctor.dto;

import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.entity.DoctorAvailability;

import java.time.format.DateTimeFormatter;
import java.util.List;

public record DoctorResponse(
        Long id,
        String name,
        String email,
        String specialization,
        int experience,
        String phone,
        String approvalStatus,
        boolean availabilityConfigured,
        String startTime,
        String endTime,
        int slotMinutes,
        List<String> workingDays,
        List<String> leaveDates) {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    public static DoctorResponse from(Doctor doctor, DoctorAvailability availability) {
        boolean configured = availability != null;
        return new DoctorResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getAccount() == null ? null : doctor.getAccount().getEmail(),
                doctor.getSpecialization(),
                doctor.getExperience(),
                doctor.getPhone(),
                doctor.getApprovalStatus(),
                configured,
                configured ? TIME_FORMAT.format(availability.getStartTime()) : null,
                configured ? TIME_FORMAT.format(availability.getEndTime()) : null,
                configured ? availability.getSlotMinutes() : 0,
                configured ? availability.getWorkingDays() : List.of(),
                configured ? availability.getLeaveDates() : List.of());
    }
}
