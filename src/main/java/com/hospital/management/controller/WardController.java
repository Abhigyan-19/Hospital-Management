package com.hospital.management.controller;

import com.hospital.management.dto.WardRequest;
import com.hospital.management.entity.Ward;
import com.hospital.management.service.WardService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wards")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public List<Ward> getAllWards() {
        return wardService.getAllWards();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Ward createWard(@Valid @RequestBody WardRequest request) {
        return wardService.createWard(request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteWard(@PathVariable Long id) {
        wardService.deleteWard(id);
    }
}
