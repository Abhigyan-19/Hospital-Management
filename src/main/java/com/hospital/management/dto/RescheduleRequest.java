package com.hospital.management.dto;

public class RescheduleRequest {

    private String date;
    private String time;
    private String newDate;
    private String newTime;

    public RescheduleRequest() {
    }

    public RescheduleRequest(String date, String time) {
        this.date = date;
        this.time = time;
    }

    public String getEffectiveDate() {
        if (date != null && !date.isBlank()) return date;
        return newDate;
    }

    public String getEffectiveTime() {
        if (time != null && !time.isBlank()) return time;
        return newTime;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getNewDate() {
        return newDate;
    }

    public void setNewDate(String newDate) {
        this.newDate = newDate;
    }

    public String getNewTime() {
        return newTime;
    }

    public void setNewTime(String newTime) {
        this.newTime = newTime;
    }
}
