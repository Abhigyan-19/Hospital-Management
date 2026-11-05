package com.hospital.management.dto;

public class BillRequest {
    private Long patientId;
    private Double amount;
    private String description;
    private String status;

    public BillRequest() {
    }

    public BillRequest(Long patientId, Double amount, String description, String status) {
        this.patientId = patientId;
        this.amount = amount;
        this.description = description;
        this.status = status;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

