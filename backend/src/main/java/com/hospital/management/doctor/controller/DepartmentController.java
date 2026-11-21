package com.hospital.management.doctor.controller;

import com.hospital.management.doctor.dto.DoctorResponse;
import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.entity.DoctorAvailability;
import com.hospital.management.doctor.repository.DoctorAvailabilityRepository;
import com.hospital.management.doctor.repository.DoctorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/departments")
public class DepartmentController {
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    public DepartmentController(DoctorRepository doctorRepository, DoctorAvailabilityRepository availabilityRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listDepartments() {
        Map<String, Doctor> departments = new LinkedHashMap<>();
        doctorRepository.findByApprovalStatusIgnoreCase("APPROVED").stream()
                .filter(doctor -> doctor.getSpecialization() != null && !doctor.getSpecialization().isBlank())
                .forEach(doctor -> departments.putIfAbsent(doctor.getSpecialization().toLowerCase(Locale.ROOT), doctor));
        return departments.values().stream()
                .map(doctor -> Map.<String, Object>of("id", doctor.getId(), "name", doctor.getSpecialization()))
                .toList();
    }

    @GetMapping("/{department}/doctors")
    @Transactional(readOnly = true)
    public List<DoctorResponse> listDoctors(@PathVariable String department) {
        List<Doctor> doctors = doctorRepository.findByApprovalStatusIgnoreCase("APPROVED").stream()
                .filter(doctor -> doctor.getSpecialization() != null
                        && doctor.getSpecialization().equalsIgnoreCase(department))
                .toList();
        if (doctors.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No doctors are registered for this department.");
        }
        return doctors.stream().map(doctor -> DoctorResponse.from(
                doctor, availabilityRepository.findByDoctor_Id(doctor.getId()).orElse(null))).toList();
    }
}
