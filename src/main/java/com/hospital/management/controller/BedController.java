package com.hospital.management.controller;

import com.hospital.management.dto.BedAssignmentRequest;
import com.hospital.management.dto.BedRequest;
import com.hospital.management.dto.BedResponse;
import com.hospital.management.dto.BedStatusRequest;
import com.hospital.management.service.BedService;
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
    public List<BedResponse> getAllBeds() {
        return bedService.getAllBeds();
    }

    @PostMapping
    public BedResponse createBed(@RequestBody BedRequest request) {
        return bedService.createBed(request);
    }

    @PatchMapping("/{id}/assign")
    public BedResponse assignPatient(@PathVariable Long id, @RequestBody BedAssignmentRequest request) {
        return bedService.assignPatient(id, request.patientId());
    }

    @PatchMapping("/{id}/release")
    public BedResponse releaseBed(@PathVariable Long id) {
        return bedService.releaseBed(id);
    }

    @PatchMapping("/{id}/status")
    public BedResponse updateStatus(@PathVariable Long id, @RequestBody BedStatusRequest request) {
        return bedService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    public void deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
    }
}