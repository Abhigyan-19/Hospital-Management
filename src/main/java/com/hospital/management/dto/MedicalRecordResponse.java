package com.hospital.management.dto;

import com.hospital.management.entity.MedicalRecord;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class MedicalRecordResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private String diagnosis;
    private String symptoms;
    private String vitals;
    private String notes;
    private LocalDateTime createdAt;

    // UI-friendly aliases for seamless compatibility with patient & doctor chart views
    private String title;
    private String date;
    private String type;
    private String detail;

    public MedicalRecordResponse() {
    }

    public static MedicalRecordResponse fromEntity(MedicalRecord record) {
        MedicalRecordResponse resp = new MedicalRecordResponse();
        resp.setId(record.getId());
        if (record.getPatient() != null) {
            resp.setPatientId(record.getPatient().getId());
            resp.setPatientName(record.getPatient().getName());
        }
        if (record.getDoctor() != null) {
            resp.setDoctorId(record.getDoctor().getId());
            resp.setDoctorName(record.getDoctor().getName());
        }
        if (record.getAppointment() != null) {
            resp.setAppointmentId(record.getAppointment().getId());
        }
        resp.setDiagnosis(record.getDiagnosis());
        resp.setSymptoms(record.getSymptoms());
        resp.setVitals(record.getVitals());
        resp.setNotes(record.getNotes());
        resp.setCreatedAt(record.getCreatedAt());

        // Fill UI convenience properties
        resp.setTitle(record.getDiagnosis() != null ? record.getDiagnosis() : "Clinical Consultation");
        if (record.getCreatedAt() != null) {
            resp.setDate(record.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        } else {
            resp.setDate("");
        }
        resp.setType("Clinical Record");
        String detailText = (record.getNotes() != null && !record.getNotes().isBlank())
                ? record.getNotes()
                : (record.getSymptoms() != null ? "Symptoms: " + record.getSymptoms() : "");
        resp.setDetail(detailText);

        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getVitals() {
        return vitals;
    }

    public void setVitals(String vitals) {
        this.vitals = vitals;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }
}
