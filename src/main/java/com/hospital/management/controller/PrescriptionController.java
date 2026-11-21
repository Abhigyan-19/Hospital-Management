package com.hospital.management.controller;

import com.hospital.management.dto.PrescriptionRequest;
import com.hospital.management.entity.Prescription;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.AuditLogService;
import com.hospital.management.service.PrescriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final AuditLogService auditLogService;

    public PrescriptionController(PrescriptionService prescriptionService, AuditLogService auditLogService) {
        this.prescriptionService = prescriptionService;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Prescription> createPrescription(
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest servletRequest) {

        Prescription created = prescriptionService.createPrescription(request, userDetails);
        int medCount = created.getMedicines() != null ? created.getMedicines().size() : 0;
        auditLogService.recordLog(userDetails, "CREATE", "PRESCRIPTION", String.valueOf(created.getId()),
                "Issued prescription #" + created.getId() + " for patient #" + created.getPatient().getId()
                        + " (" + medCount + " medicines)", servletRequest);

        return ResponseEntity.ok(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<List<Prescription>> getAllPrescriptions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest servletRequest) {

        List<Prescription> prescriptions = prescriptionService.getPrescriptionsForUser(userDetails);
        auditLogService.recordLog(userDetails, "READ", "PRESCRIPTION", "LIST",
                "Retrieved " + prescriptions.size() + " prescription records", servletRequest);

        return ResponseEntity.ok(prescriptions);
    }
}
