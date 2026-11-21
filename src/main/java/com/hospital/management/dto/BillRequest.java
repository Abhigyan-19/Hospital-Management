package com.hospital.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class BillRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Double amount; // Grand total (computed automatically if items provided)

    private String description;

    private String status;

    private Double taxRate = 0.18; // Default 18% GST

    private String paymentMethod; // CASH, CARD, UPI

    @Valid
    private List<BillItemRequest> items = new ArrayList<>();

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

    public Double getTaxRate() {
        return taxRate != null ? taxRate : 0.18;
    }

    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public List<BillItemRequest> getItems() {
        return items;
    }

    public void setItems(List<BillItemRequest> items) {
        this.items = items;
    }
}
