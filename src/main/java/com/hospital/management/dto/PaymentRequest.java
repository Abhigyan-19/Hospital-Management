package com.hospital.management.dto;

public class PaymentRequest {

    private String paymentMethod;

    public PaymentRequest() {
    }

    public PaymentRequest(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentMethod() {
        return (paymentMethod != null && !paymentMethod.isBlank()) ? paymentMethod.trim().toUpperCase() : "CASH";
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
