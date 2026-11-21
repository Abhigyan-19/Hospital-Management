package com.hospital.management.controller;

import com.hospital.management.entity.Patient;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.AuditLogService;
import com.hospital.management.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final AuditLogService auditLogService;

    public PatientController(PatientService patientService, AuditLogService auditLogService) {
        this.patientService = patientService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public List<Patient> getAllPatients(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        List<Patient> patients = patientService.getAllPatients();
        auditLogService.recordLog(userDetails, "READ", "PATIENT", "ALL",
                "Accessed full patient directory (" + patients.size() + " records)", request);
        return patients;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR') or (hasRole('PATIENT') and principal.patientId == #id)")
    public Patient getPatientById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        Patient patient = patientService.getPatientById(id);
        auditLogService.recordLog(userDetails, "READ", "PATIENT", String.valueOf(id),
                "Viewed details for patient #" + id + " (" + patient.getName() + ")", request);
        return patient;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Patient createPatient(
            @Valid @RequestBody Patient patient,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        Patient created = patientService.createPatient(patient);
        auditLogService.recordLog(userDetails, "CREATE", "PATIENT", String.valueOf(created.getId()),
                "Registered new patient record: " + created.getName(), request);
        return created;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePatient(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        patientService.deletePatient(id);
        auditLogService.recordLog(userDetails, "DELETE", "PATIENT", String.valueOf(id),
                "Deleted patient record #" + id, request);
    }
}
