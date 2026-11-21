package com.hospital.management.admin.controller;

import com.hospital.management.admin.dto.DoctorReviewRequest;
import com.hospital.management.doctor.dto.DoctorResponse;
import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.entity.DoctorAvailability;
import com.hospital.management.doctor.repository.DoctorAvailabilityRepository;
import com.hospital.management.doctor.repository.DoctorRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/admin/doctors")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorApprovalController {
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    public AdminDoctorApprovalController(
            DoctorRepository doctorRepository,
            DoctorAvailabilityRepository availabilityRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @GetMapping("/pending")
    @Transactional(readOnly = true)
    public List<DoctorResponse> listPending() {
        return doctorRepository.findByApprovalStatusIgnoreCase("PENDING").stream()
                .map(this::response).toList();
    }

    @PatchMapping("/{id}/verification")
    @Transactional
    public DoctorResponse review(
            @PathVariable Long id,
            @Valid @RequestBody DoctorReviewRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found."));
        if (!"PENDING".equals(doctor.getApprovalStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending doctor registrations can be reviewed.");
        }
        doctor.setApprovalStatus(request.approvalStatus());
        return response(doctorRepository.save(doctor));
    }

    private DoctorResponse response(Doctor doctor) {
        DoctorAvailability availability = availabilityRepository.findByDoctor_Id(doctor.getId()).orElse(null);
        return DoctorResponse.from(doctor, availability);
    }
}
