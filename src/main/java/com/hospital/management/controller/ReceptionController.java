package com.hospital.management.controller;

import com.hospital.management.dto.BillRequest;
import com.hospital.management.dto.PaymentRequest;
import com.hospital.management.dto.RescheduleRequest;
import com.hospital.management.entity.Appointment;
import com.hospital.management.entity.Bill;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.AppointmentService;
import com.hospital.management.service.BillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/reception")
public class ReceptionController {

    private final AppointmentService appointmentService;
    private final BillService billService;

    public ReceptionController(AppointmentService appointmentService, BillService billService) {
        this.appointmentService = appointmentService;
        this.billService = billService;
    }

    @PostMapping("/appointments/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Appointment checkIn(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.updateStatus(id, "Confirmed", userDetails);
    }

    @PatchMapping("/appointments/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Appointment reschedule(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return appointmentService.rescheduleAppointment(id, request.getEffectiveDate(), request.getEffectiveTime(), userDetails);
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public List<Bill> listInvoices() {
        return billService.getAllBills();
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Bill createInvoice(@Valid @RequestBody BillRequest request) {
        return billService.createBill(request);
    }

    @PatchMapping("/invoices/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Bill recordPayment(
            @PathVariable Long id,
            @RequestBody PaymentRequest paymentRequest) {
        return billService.recordPayment(id, paymentRequest.getPaymentMethod());
    }

    @GetMapping("/invoices/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) throws IOException {
        Bill bill = billService.getBillById(id);
        byte[] pdfBytes = billService.getInvoicePdfBytes(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Invoice-" + bill.getInvoiceNumber() + ".pdf\"")
                .body(pdfBytes);
    }
}
