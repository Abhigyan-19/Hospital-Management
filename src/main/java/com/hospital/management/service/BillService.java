package com.hospital.management.service;

import com.hospital.management.dto.BillRequest;
import com.hospital.management.entity.Bill;
import com.hospital.management.entity.Patient;
import com.hospital.management.repository.BillRepository;
import com.hospital.management.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;
    private final SmsService smsService;

    public BillService(BillRepository billRepository, PatientRepository patientRepository, SmsService smsService) {
        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
        this.smsService = smsService;
    }

    public List<Bill> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Bill> getBillsForPatient(Long patientId) {
        return billRepository.findByPatient_IdOrderByCreatedAtDesc(patientId);
    }

    public Bill createBill(BillRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));

        String invoiceNumber = "INV-" + (1000 + billRepository.count() + 1);
        String status = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus()
                : "PENDING";

        Bill bill = new Bill(
                invoiceNumber,
                patient,
                request.getAmount(),
                request.getDescription(),
                status
        );

        Bill saved = billRepository.save(bill);

        // Send SMS notification for the bill
        smsService.sendBillingSms(patient, saved.getInvoiceNumber(), saved.getAmount(), saved.getDescription(), saved.getStatus());

        return saved;
    }

    public Bill updateStatus(Long id, String status) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));

        bill.setStatus(status);
        Bill updated = billRepository.save(bill);

        // Send updated SMS
        smsService.sendBillingSms(updated.getPatient(), updated.getInvoiceNumber(), updated.getAmount(), updated.getDescription(), updated.getStatus());

        return updated;
    }
}

