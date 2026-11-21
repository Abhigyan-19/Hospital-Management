package com.hospital.management.patient.controller;

import com.hospital.management.patient.dto.LinkedPatientRequest;
import com.hospital.management.patient.dto.PatientRequest;
import com.hospital.management.patient.dto.PatientResponse;
import com.hospital.management.patient.service.PatientService;
import com.hospital.management.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {
    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public PatientResponse createPatient(@Valid @RequestBody PatientRequest request) {
        return patientService.createStaffPatient(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public List<PatientResponse> getAllPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public PatientResponse getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
    }

    @GetMapping("/me/linked")
    @PreAuthorize("hasRole('PATIENT')")
    public List<PatientResponse> linkedPatients(@AuthenticationPrincipal AuthenticatedUser user) {
        return patientService.getLinkedPatients(user);
    }

    @PostMapping("/me/linked")
    @PreAuthorize("hasRole('PATIENT')")
    public PatientResponse addLinkedPatient(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody LinkedPatientRequest request) {
        return patientService.addLinkedPatient(user, request);
    }
}
