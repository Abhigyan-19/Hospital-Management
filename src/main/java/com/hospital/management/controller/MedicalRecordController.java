package com.hospital.management.controller;

import com.hospital.management.dto.MedicalRecordRequest;
import com.hospital.management.dto.MedicalRecordResponse;
import com.hospital.management.entity.MedicalRecord;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.MedicalRecordRepository;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;
    private final MedicalRecordRepository medicalRecordRepository;

    public MedicalRecordController(
            MedicalRecordService medicalRecordService,
            MedicalRecordRepository medicalRecordRepository) {
        this.medicalRecordService = medicalRecordService;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public MedicalRecordResponse createMedicalRecord(
            @Valid @RequestBody MedicalRecordRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return medicalRecordService.createMedicalRecord(request, userDetails);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST') or (hasRole('PATIENT') and principal.patientId == #patientId)")
    public List<MedicalRecordResponse> getPatientMedicalRecords(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return medicalRecordService.getRecordsByPatient(patientId, userDetails);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    public MedicalRecordResponse getById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));
        return MedicalRecordResponse.fromEntity(record);
    }
}
