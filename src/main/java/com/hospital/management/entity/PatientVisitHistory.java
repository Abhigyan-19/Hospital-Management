package com.hospital.management.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_visit_history", indexes = {
        @Index(name = "idx_pvh_patient", columnList = "patient_id, completed_at"),
        @Index(name = "idx_pvh_search_name", columnList = "patient_name"),
        @Index(name = "idx_pvh_search_phone", columnList = "patient_phone")
})
public class PatientVisitHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_phone")
    private String patientPhone;

    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "doctor_specialization")
    private String doctorSpecialization;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "visit_date")
    private String visitDate;

    @Column(name = "visit_time")
    private String visitTime;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "treatment_notes", columnDefinition = "TEXT")
    private String treatmentNotes;

    @Column(name = "prescriptions_summary", columnDefinition = "TEXT")
    private String prescriptionsSummary;

    @Column(columnDefinition = "TEXT")
    private String vitals;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public PatientVisitHistory() {
    }

    public PatientVisitHistory(Long patientId, String patientName, String patientPhone,
                               Long doctorId, String doctorName, String doctorSpecialization,
                               Long appointmentId, String visitDate, String visitTime,
                               String diagnosis, String symptoms, String treatmentNotes,
                               String prescriptionsSummary, String vitals) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientPhone = patientPhone;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.doctorSpecialization = doctorSpecialization;
        this.appointmentId = appointmentId;
        this.visitDate = visitDate;
        this.visitTime = visitTime;
        this.diagnosis = diagnosis;
        this.symptoms = symptoms;
        this.treatmentNotes = treatmentNotes;
        this.prescriptionsSummary = prescriptionsSummary;
        this.vitals = vitals;
        this.completedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
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
