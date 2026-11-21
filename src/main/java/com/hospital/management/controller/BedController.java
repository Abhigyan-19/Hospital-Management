package com.hospital.management.controller;

import com.hospital.management.dto.BedAssignmentRequest;
import com.hospital.management.dto.BedRequest;
import com.hospital.management.dto.BedResponse;
import com.hospital.management.dto.BedStatusRequest;
import com.hospital.management.service.BedService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/beds")
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public List<BedResponse> getAllBeds() {
        return bedService.getAllBeds();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public BedResponse createBed(@Valid @RequestBody BedRequest request) {
        return bedService.createBed(request);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public BedResponse assignPatient(@PathVariable Long id, @RequestBody BedAssignmentRequest request) {
        return bedService.assignPatient(id, request.patientId());
    }

    @PatchMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public BedResponse releaseBed(@PathVariable Long id) {
        return bedService.releaseBed(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public BedResponse updateStatus(@PathVariable Long id, @RequestBody BedStatusRequest request) {
        return bedService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
    }
}
