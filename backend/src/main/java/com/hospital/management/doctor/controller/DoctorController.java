package com.hospital.management.doctor.controller;

import com.hospital.management.doctor.dto.AvailabilityRequest;
import com.hospital.management.doctor.dto.AvailabilityResponse;
import com.hospital.management.doctor.dto.DoctorRequest;
import com.hospital.management.doctor.dto.DoctorResponse;
import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.entity.DoctorAvailability;
import com.hospital.management.appointment.repository.AppointmentRepository;
import com.hospital.management.doctor.repository.DoctorAvailabilityRepository;
import com.hospital.management.doctor.repository.DoctorRepository;
import com.hospital.management.doctor.service.DoctorAvailabilityService;
import com.hospital.management.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorAvailabilityService availabilityService;

    public DoctorController(
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            DoctorAvailabilityRepository availabilityRepository,
            DoctorAvailabilityService availabilityService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.availabilityRepository = availabilityRepository;
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findByApprovalStatusIgnoreCase("APPROVED")
                .stream().map(this::response).toList();
    }

    @GetMapping("/{id}")
    public DoctorResponse getDoctorById(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .filter(item -> "APPROVED".equals(item.getApprovalStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found."));
        return response(doctor);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public DoctorResponse createDoctor(@Valid @RequestBody DoctorRequest request) {
        Doctor doctor = new Doctor(request.name().trim(), request.specialization().trim(), request.experience());
        return response(doctorRepository.save(doctor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteDoctor(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found."));
        if (doctor.getAccount() != null || appointmentRepository.existsByDoctor_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctors with accounts or appointment history cannot be deleted.");
        }
        doctorRepository.delete(doctor);
    }

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public AvailabilityResponse getAvailability(@AuthenticationPrincipal AuthenticatedUser user) {
        return availabilityService.getMine(user);
    }

    @PatchMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public AvailabilityResponse updateAvailability(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody AvailabilityRequest request) {
        return availabilityService.updateMine(user, request);
    }

    private DoctorResponse response(Doctor doctor) {
        DoctorAvailability availability = availabilityRepository.findByDoctor_Id(doctor.getId()).orElse(null);
        return DoctorResponse.from(doctor, availability);
    }
}
