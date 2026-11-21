package com.hospital.management.service;

import com.hospital.management.dto.BillItemRequest;
import com.hospital.management.dto.BillRequest;
import com.hospital.management.entity.Bill;
import com.hospital.management.entity.BillItem;
import com.hospital.management.entity.Patient;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.BillRepository;
import com.hospital.management.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;
    private final SmsService smsService;
    private final PdfInvoiceGenerator pdfInvoiceGenerator;

    public BillService(
            BillRepository billRepository,
            PatientRepository patientRepository,
            SmsService smsService,
            PdfInvoiceGenerator pdfInvoiceGenerator) {
        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
        this.smsService = smsService;
        this.pdfInvoiceGenerator = pdfInvoiceGenerator;
    }

    public List<Bill> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Bill> getBillsForPatient(Long patientId) {
        return billRepository.findByPatient_IdOrderByCreatedAtDesc(patientId);
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    @Transactional
    public Bill createBill(BillRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        String invoiceNumber = "INV-" + (1000 + billRepository.count() + 1);
        String status = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus().trim().toUpperCase()
                : "PENDING";

        double taxRate = request.getTaxRate() != null ? request.getTaxRate() : 0.18;
        double subtotal = 0.0;

        Bill bill = new Bill();
        bill.setInvoiceNumber(invoiceNumber);
        bill.setPatient(patient);
        bill.setDescription(request.getDescription() != null && !request.getDescription().isBlank()
                ? request.getDescription()
                : "Hospital medical charges");
        bill.setStatus(status);
        bill.setTaxRate(taxRate);
        bill.setCreatedAt(LocalDateTime.now());

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (BillItemRequest itemReq : request.getItems()) {
                BillItem item = new BillItem(bill, itemReq.getDescription(), itemReq.getQuantity(), itemReq.getUnitPrice());
                subtotal += item.getTotalPrice();
                bill.addItem(item);
            }
        } else if (request.getAmount() != null && request.getAmount() > 0) {
            // Legacy single-amount support: calculate subtotal before tax
            double total = request.getAmount();
            subtotal = Math.round((total / (1.0 + taxRate)) * 100.0) / 100.0;
            BillItem item = new BillItem(bill, bill.getDescription(), 1, subtotal);
            bill.addItem(item);
        } else {
            throw new IllegalArgumentException("Bill must include at least one item or an amount greater than zero.");
        }

        subtotal = Math.round(subtotal * 100.0) / 100.0;
        double taxAmount = Math.round((subtotal * taxRate) * 100.0) / 100.0;
        double totalAmount = Math.round((subtotal + taxAmount) * 100.0) / 100.0;

        bill.setSubtotal(subtotal);
        bill.setTaxAmount(taxAmount);
        bill.setAmount(totalAmount);

        if ("PAID".equalsIgnoreCase(status)) {
            String method = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                    ? request.getPaymentMethod().trim().toUpperCase()
                    : "CASH";
            bill.setPaymentMethod(method);
            bill.setPaidAt(LocalDateTime.now());
        }

        Bill saved = billRepository.save(bill);

        // Send non-blocking SMS notification for the bill
        smsService.sendBillingSms(patient, saved.getInvoiceNumber(), saved.getAmount(), saved.getDescription(), saved.getStatus());

        return saved;
    }

    @Transactional
    public Bill recordPayment(Long id, String paymentMethod) {
        Bill bill = getBillById(id);

        String method = (paymentMethod != null && !paymentMethod.isBlank())
                ? paymentMethod.trim().toUpperCase()
                : "CASH";

        // Validate allowed payment methods
        if (!List.of("CASH", "CARD", "UPI").contains(method)) {
            method = "CASH";
        }

        bill.setStatus("PAID");
        bill.setPaymentMethod(method);
        bill.setPaidAt(LocalDateTime.now());

        Bill updated = billRepository.save(bill);

        // Send payment receipt SMS
        smsService.sendBillingSms(updated.getPatient(), updated.getInvoiceNumber(), updated.getAmount(),
                "Payment received via " + method, "PAID");

        return updated;
    }

    @Transactional
    public Bill updateStatus(Long id, String status) {
        Bill bill = getBillById(id);
        String upperStatus = status.trim().toUpperCase();
        bill.setStatus(upperStatus);
        if ("PAID".equals(upperStatus) && bill.getPaidAt() == null) {
            bill.setPaidAt(LocalDateTime.now());
            if (bill.getPaymentMethod() == null) {
                bill.setPaymentMethod("CASH");
            }
        }
        Bill updated = billRepository.save(bill);

        smsService.sendBillingSms(updated.getPatient(), updated.getInvoiceNumber(), updated.getAmount(), updated.getDescription(), updated.getStatus());

        return updated;
    }

    public byte[] getInvoicePdfBytes(Long billId) throws IOException {
        Bill bill = getBillById(billId);
        return pdfInvoiceGenerator.generateInvoicePdf(bill);
    }
}
