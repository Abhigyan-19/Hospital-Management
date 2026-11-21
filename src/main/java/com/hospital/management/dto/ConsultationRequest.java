package com.hospital.management.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class ConsultationRequest {

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Consultation notes are required")
    private String notes;

    private List<String> labTests = new ArrayList<>();

    private boolean createPrescription = false;

    private String prescriptionNotes;

    private List<PrescriptionRequest.MedicineRequest> medicines = new ArrayList<>();

    public ConsultationRequest() {
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<String> getLabTests() {
        return labTests;
    }

    public void setLabTests(List<String> labTests) {
        this.labTests = labTests;
    }

    public boolean isCreatePrescription() {
        return createPrescription;
    }

    public void setCreatePrescription(boolean createPrescription) {
        this.createPrescription = createPrescription;
    }

    public String getPrescriptionNotes() {
        return prescriptionNotes;
    }

    public void setPrescriptionNotes(String prescriptionNotes) {
        this.prescriptionNotes = prescriptionNotes;
    }

    public List<PrescriptionRequest.MedicineRequest> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionRequest.MedicineRequest> medicines) {
        this.medicines = medicines;
    }
}
