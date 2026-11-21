package com.hospital.management.dto;

import com.hospital.management.entity.PatientVisitHistory;

import java.time.LocalDateTime;

public class PatientVisitHistoryDto {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private Long appointmentId;
    private String visitDate;
    private String visitTime;
    private String diagnosis;
    private String symptoms;
    private String treatmentNotes;
    private String prescriptionsSummary;
    private String vitals;
    private LocalDateTime completedAt;

    public PatientVisitHistoryDto() {
    }

    public static PatientVisitHistoryDto fromEntity(PatientVisitHistory entity) {
        if (entity == null) return null;
        PatientVisitHistoryDto dto = new PatientVisitHistoryDto();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatientId());
        dto.setPatientName(entity.getPatientName());
        dto.setPatientPhone(entity.getPatientPhone());
        dto.setDoctorId(entity.getDoctorId());
        dto.setDoctorName(entity.getDoctorName());
        dto.setDoctorSpecialization(entity.getDoctorSpecialization());
        dto.setAppointmentId(entity.getAppointmentId());
        dto.setVisitDate(entity.getVisitDate());
        dto.setVisitTime(entity.getVisitTime());
        dto.setDiagnosis(entity.getDiagnosis());
        dto.setSymptoms(entity.getSymptoms());
        dto.setTreatmentNotes(entity.getTreatmentNotes());
        dto.setPrescriptionsSummary(entity.getPrescriptionsSummary());
        dto.setVitals(entity.getVitals());
        dto.setCompletedAt(entity.getCompletedAt());
        return dto;
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

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
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

    public String getDoctorSpecialization() {
        return doctorSpecialization;
    }

    public void setDoctorSpecialization(String doctorSpecialization) {
        this.doctorSpecialization = doctorSpecialization;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(String visitDate) {
        this.visitDate = visitDate;
    }

    public String getVisitTime() {
        return visitTime;
    }

    public void setVisitTime(String visitTime) {
        this.visitTime = visitTime;
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

    public String getTreatmentNotes() {
        return treatmentNotes;
    }

    public void setTreatmentNotes(String treatmentNotes) {
        this.treatmentNotes = treatmentNotes;
    }

    public String getPrescriptionsSummary() {
        return prescriptionsSummary;
    }

    public void setPrescriptionsSummary(String prescriptionsSummary) {
        this.prescriptionsSummary = prescriptionsSummary;
    }

    public String getVitals() {
        return vitals;
    }

    public void setVitals(String vitals) {
        this.vitals = vitals;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
