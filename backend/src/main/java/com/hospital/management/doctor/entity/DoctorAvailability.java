package com.hospital.management.doctor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "doctor_availability")
public class DoctorAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false, unique = true)
    private Doctor doctor;

    @Column(name = "working_days", nullable = false, length = 100)
    private String workingDays;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "slot_minutes", nullable = false)
    private int slotMinutes;

    @Column(name = "leave_dates", nullable = false, columnDefinition = "TEXT")
    private String leaveDates = "";

    protected DoctorAvailability() {
    }

    public DoctorAvailability(
            Doctor doctor,
            List<String> workingDays,
            LocalTime startTime,
            LocalTime endTime,
            int slotMinutes,
            List<String> leaveDates) {
        this.doctor = doctor;
        update(workingDays, startTime, endTime, slotMinutes, leaveDates);
    }

    public void update(
            List<String> workingDays,
            LocalTime startTime,
            LocalTime endTime,
            int slotMinutes,
            List<String> leaveDates) {
        this.workingDays = String.join(",", workingDays);
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotMinutes = slotMinutes;
        this.leaveDates = String.join(",", leaveDates);
    }

    public List<String> getWorkingDays() {
        return csvValues(workingDays);
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public int getSlotMinutes() {
        return slotMinutes;
    }

    public List<String> getLeaveDates() {
        return csvValues(leaveDates);
    }

    private List<String> csvValues(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(",")).filter(item -> !item.isBlank()).toList();
    }
}
