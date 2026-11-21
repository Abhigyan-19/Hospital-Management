package com.hospital.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "prescription_medicines")
public class PrescriptionMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String dosage;

    private String frequency;

    private String duration;

    @Column(name = "patient_instructions", length = 500)
    private String patientInstructions;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    public PrescriptionMedicine() {
    }

    public PrescriptionMedicine(
            String name,
            String dosage,
            String frequency,
            String duration
    ) {
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
    }

    public PrescriptionMedicine(
            String name,
            String dosage,
            String frequency,
            String duration,
            String patientInstructions
    ) {
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
        this.patientInstructions = patientInstructions;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getPatientInstructions() {
        return patientInstructions;
    }

    public void setPatientInstructions(String patientInstructions) {
        this.patientInstructions = patientInstructions;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }
}
