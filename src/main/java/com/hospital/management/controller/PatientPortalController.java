package com.hospital.management.controller;

import com.hospital.management.dto.MedicalRecordResponse;
import com.hospital.management.dto.PatientProfileDto;
import com.hospital.management.entity.Bill;
import com.hospital.management.entity.Patient;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.BillService;
import com.hospital.management.service.MedicalRecordService;
import com.hospital.management.service.PatientService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients/me")
public class PatientPortalController {

    private final PatientService patientService;
    private final MedicalRecordService medicalRecordService;
    private final BillService billService;

    public PatientPortalController(
            PatientService patientService,
            MedicalRecordService medicalRecordService,
            BillService billService) {
        this.patientService = patientService;
        this.medicalRecordService = medicalRecordService;
        this.billService = billService;
    }

    @GetMapping("/linked")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public List<PatientProfileDto> listLinkedProfiles(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return patientService.getLinkedProfiles(userDetails);
    }

    @PostMapping("/linked")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public Patient addLinkedProfile(
            @RequestBody Patient profile,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return patientService.createPatient(profile);
    }

    @GetMapping("/linked/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public Patient getProfile(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return patientService.getPatientById(patientId);
    }

    @PatchMapping("/linked/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public Patient updateProfile(
            @PathVariable Long patientId,
            @RequestBody Patient changes,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return patientService.updatePatient(patientId, changes, userDetails);
    }

    @GetMapping("/linked/{patientId}/history")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public List<MedicalRecordResponse> getMedicalHistory(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return medicalRecordService.getRecordsByPatient(patientId, userDetails);
    }

    @GetMapping("/linked/{patientId}/lab-reports")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public List<Object> listLabReports(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return List.of(); // Future lab integrations
    }

    @GetMapping("/linked/{patientId}/invoices")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public List<Bill> listInvoices(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return billService.getBillsByPatient(patientId);
    }
}
