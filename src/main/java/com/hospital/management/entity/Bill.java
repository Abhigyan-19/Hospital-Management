package com.hospital.management.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "subtotal")
    private Double subtotal;

    @Column(name = "tax_rate")
    private Double taxRate = 0.18; // Default 18% GST

    @Column(name = "tax_amount")
    private Double taxAmount = 0.0;

    @Column(nullable = false)
    private Double amount; // Grand total (retained for database and backwards-compatibility)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, PAID, CANCELLED

    @Column(name = "payment_method")
    private String paymentMethod; // CASH, CARD, UPI

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<BillItem> items = new ArrayList<>();

    public Bill() {
        this.createdAt = LocalDateTime.now();
    }

    public Bill(String invoiceNumber, Patient patient, Double amount, String description, String status) {
        this.invoiceNumber = invoiceNumber;
        this.patient = patient;
        this.amount = amount;
        this.subtotal = amount;
        this.taxRate = 0.0;
        this.taxAmount = 0.0;
        this.description = description;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public Bill(String invoiceNumber, Patient patient, Double subtotal, Double taxRate, Double taxAmount, Double totalAmount, String description, String status) {
        this.invoiceNumber = invoiceNumber;
        this.patient = patient;
        this.subtotal = subtotal;
        this.taxRate = taxRate;
        this.taxAmount = taxAmount;
        this.amount = totalAmount;
        this.description = description;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.amount == null && this.subtotal != null) {
            this.amount = Math.round((this.subtotal + (this.taxAmount != null ? this.taxAmount : 0.0)) * 100.0) / 100.0;
        }
    }

    public void addItem(BillItem item) {
        items.add(item);
        item.setBill(this);
    }

    public void removeItem(BillItem item) {
        items.remove(item);
        item.setBill(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Double getSubtotal() {
        return subtotal != null ? subtotal : amount;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getTaxRate() {
        return taxRate != null ? taxRate : 0.0;
    }

    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }

    public Double getTaxAmount() {
        return taxAmount != null ? taxAmount : 0.0;
    }

    public void setTaxAmount(Double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getTotalAmount() {
        return amount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.amount = totalAmount;
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

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<BillItem> getItems() {
        return items;
    }

    public void setItems(List<BillItem> items) {
        this.items = items;
    }
}
