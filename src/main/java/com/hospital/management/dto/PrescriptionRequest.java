package com.hospital.management.dto;

import java.util.List;

public class PrescriptionRequest {

    private Long patientId;
    private Long doctorId;
    private String notes;
    private List<MedicineRequest> medicines;

    public PrescriptionRequest() {
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<MedicineRequest> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<MedicineRequest> medicines) {
        this.medicines = medicines;
    }

    public static class MedicineRequest {

        private String name;
        private String dosage;
        private String frequency;
        private String duration;

        public MedicineRequest() {
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
    }
}