package com.hospital.management.controller;

import com.hospital.management.dto.DoctorAvailabilityDto;
import com.hospital.management.entity.Doctor;
import com.hospital.management.service.DoctorAvailabilityService;
import com.hospital.management.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorAvailabilityService doctorAvailabilityService;

    public DoctorController(DoctorService doctorService, DoctorAvailabilityService doctorAvailabilityService) {
        this.doctorService = doctorService;
        this.doctorAvailabilityService = doctorAvailabilityService;
    }

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/{id}")
    public Doctor getDoctorById(@PathVariable Long id) {
        return doctorService.getDoctorById(id);
    }

    @GetMapping("/{id}/availability")
    public DoctorAvailabilityDto getDoctorAvailability(@PathVariable Long id) {
        return doctorAvailabilityService.getAvailability(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Doctor createDoctor(@Valid @RequestBody Doctor doctor) {
        return doctorService.createDoctor(doctor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
    }
}
