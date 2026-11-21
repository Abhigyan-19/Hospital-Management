package com.hospital.management.entity;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "doctor_availability")
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false, unique = true)
    private Doctor doctor;

    @Column(name = "working_days", length = 500)
    private String workingDays;

    @Column(name = "start_time", length = 10)
    private String startTime;

    @Column(name = "end_time", length = 10)
    private String endTime;

    @Column(name = "slot_minutes")
    private int slotMinutes = 30;

    @Column(name = "leave_dates", length = 1000)
    private String leaveDates;

    public DoctorAvailability() {
    }

    public DoctorAvailability(Doctor doctor, String workingDays, String startTime, String endTime, int slotMinutes, String leaveDates) {
        this.doctor = doctor;
        this.workingDays = workingDays;
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotMinutes = slotMinutes;
        this.leaveDates = leaveDates;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(String workingDays) {
        this.workingDays = workingDays;
    }

    public List<String> getWorkingDaysList() {
        if (workingDays == null || workingDays.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(workingDays.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setWorkingDaysList(List<String> list) {
        if (list == null || list.isEmpty()) {
            this.workingDays = "";
        } else {
            this.workingDays = String.join(",", list);
        }
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public int getSlotMinutes() {
        return slotMinutes;
    }

    public void setSlotMinutes(int slotMinutes) {
        this.slotMinutes = slotMinutes;
    }

    public String getLeaveDates() {
        return leaveDates;
    }

    public void setLeaveDates(String leaveDates) {
        this.leaveDates = leaveDates;
    }

    public List<String> getLeaveDatesList() {
        if (leaveDates == null || leaveDates.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(leaveDates.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setLeaveDatesList(List<String> list) {
        if (list == null || list.isEmpty()) {
            this.leaveDates = "";
        } else {
            this.leaveDates = String.join(",", list);
        }
    }
}
