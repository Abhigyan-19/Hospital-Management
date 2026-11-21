package com.hospital.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "bill_items")
public class BillItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    public BillItem() {
    }

    public BillItem(Bill bill, String description, Integer quantity, Double unitPrice) {
        this.bill = bill;
        this.description = description;
        this.quantity = (quantity != null && quantity > 0) ? quantity : 1;
        this.unitPrice = unitPrice != null ? unitPrice : 0.0;
        this.totalPrice = Math.round(this.quantity * this.unitPrice * 100.0) / 100.0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Bill getBill() {
        return bill;
    }

    public void setBill(Bill bill) {
        this.bill = bill;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        recalculateTotal();
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
        recalculateTotal();
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    private void recalculateTotal() {
        int q = (this.quantity != null && this.quantity > 0) ? this.quantity : 1;
        double u = this.unitPrice != null ? this.unitPrice : 0.0;
        this.totalPrice = Math.round(q * u * 100.0) / 100.0;
    }
}
