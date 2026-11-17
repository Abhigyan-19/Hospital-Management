package com.hospital.management.prescription.controller;

import com.hospital.management.prescription.dto.PrescriptionRequest;
import com.hospital.management.prescription.entity.Prescription;
import com.hospital.management.prescription.service.PrescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<Prescription> createPrescription(
            @RequestBody PrescriptionRequest request) {

        return ResponseEntity.ok(
                prescriptionService.createPrescription(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {

        return ResponseEntity.ok(
                prescriptionService.getAllPrescriptions()
        );
    }
}