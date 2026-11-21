package com.hospital.management.dto;

import java.util.ArrayList;
import java.util.List;

public class DoctorAvailabilityDto {

    private List<String> workingDays = new ArrayList<>();
    private String startTime = "09:00";
    private String endTime = "17:00";
    private int slotMinutes = 30;
    private List<String> leaveDates = new ArrayList<>();

    public DoctorAvailabilityDto() {
    }

    public DoctorAvailabilityDto(List<String> workingDays, String startTime, String endTime, int slotMinutes, List<String> leaveDates) {
        this.workingDays = workingDays != null ? workingDays : new ArrayList<>();
        this.startTime = startTime != null ? startTime : "09:00";
        this.endTime = endTime != null ? endTime : "17:00";
        this.slotMinutes = slotMinutes > 0 ? slotMinutes : 30;
        this.leaveDates = leaveDates != null ? leaveDates : new ArrayList<>();
    }

    public List<String> getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(List<String> workingDays) {
        this.workingDays = workingDays;
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

    public List<String> getLeaveDates() {
        return leaveDates;
    }

    public void setLeaveDates(List<String> leaveDates) {
        this.leaveDates = leaveDates;
    }
}
