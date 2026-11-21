package com.hospital.management.controller;

import com.hospital.management.dto.BillRequest;
import com.hospital.management.entity.Bill;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.AuditLogService;
import com.hospital.management.service.BillService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bills")
public class BillController {

    private final BillService billService;
    private final AuditLogService auditLogService;

    public BillController(BillService billService, AuditLogService auditLogService) {
        this.billService = billService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public List<Bill> getAllBills(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        List<Bill> bills = billService.getAllBills();
        auditLogService.recordLog(userDetails, "READ", "BILL", "ALL",
                "Accessed hospital billing list (" + bills.size() + " bills)", request);
        return bills;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public List<Bill> getBillsForPatient(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        List<Bill> bills = billService.getBillsForPatient(patientId);
        auditLogService.recordLog(userDetails, "READ", "BILL", "PATIENT-" + patientId,
                "Retrieved billing statements for patient #" + patientId + " (" + bills.size() + " invoices)", request);
        return bills;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Bill createBill(
            @Valid @RequestBody BillRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest servletRequest) {

        Bill bill = billService.createBill(request);
        auditLogService.recordLog(userDetails, "CREATE", "BILL", bill.getInvoiceNumber(),
                "Generated invoice " + bill.getInvoiceNumber() + " for ₹" + bill.getAmount() + " (Patient #" + bill.getPatient().getId() + ")", servletRequest);
        return bill;
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Bill updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest servletRequest) {

        String status = body.getOrDefault("status", "PAID");
        Bill updated = billService.updateStatus(id, status);
        auditLogService.recordLog(userDetails, "UPDATE", "BILL", updated.getInvoiceNumber(),
                "Updated status of invoice " + updated.getInvoiceNumber() + " to " + status, servletRequest);
        return updated;
    }
}
