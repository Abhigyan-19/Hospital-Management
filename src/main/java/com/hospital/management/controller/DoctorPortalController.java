package com.hospital.management.controller;

import com.hospital.management.dto.*;
import com.hospital.management.entity.Appointment;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.security.CustomUserDetails;
import com.hospital.management.service.AppointmentService;
import com.hospital.management.service.DoctorAvailabilityService;
import com.hospital.management.service.DoctorService;
import com.hospital.management.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors/me")
public class DoctorPortalController {

    private final DoctorService doctorService;
    private final DoctorAvailabilityService doctorAvailabilityService;
    private final MedicalRecordService medicalRecordService;
    private final AppointmentService appointmentService;

    public DoctorPortalController(
            DoctorService doctorService,
            DoctorAvailabilityService doctorAvailabilityService,
            MedicalRecordService medicalRecordService,
            AppointmentService appointmentService) {
        this.doctorService = doctorService;
        this.doctorAvailabilityService = doctorAvailabilityService;
        this.medicalRecordService = medicalRecordService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/availability")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public DoctorAvailabilityDto getAvailability(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long doctorId = resolveDoctorId(userDetails);
        return doctorAvailabilityService.getAvailability(doctorId);
    }

    @PatchMapping("/availability")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public DoctorAvailabilityDto updateAvailability(
            @RequestBody DoctorAvailabilityDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long doctorId = resolveDoctorId(userDetails);
        return doctorAvailabilityService.updateAvailability(doctorId, dto);
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public List<Patient> listPatients(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long doctorId = resolveDoctorId(userDetails);
        return doctorService.getAssignedPatients(doctorId, search);
    }

    @GetMapping("/patients/{patientId}/chart")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public PatientChartDto getPatientChart(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return medicalRecordService.getPatientChart(patientId, userDetails);
    }

    @PostMapping("/appointments/{appointmentId}/consultation")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public MedicalRecordResponse saveConsultation(
            @PathVariable Long appointmentId,
            @Valid @RequestBody ConsultationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return medicalRecordService.recordConsultation(appointmentId, request, userDetails);
    }

    @PostMapping("/appointments/{appointmentId}/follow-ups")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public Appointment scheduleFollowUp(
            @PathVariable Long appointmentId,
            @RequestBody RescheduleRequest slot,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long doctorId = resolveDoctorId(userDetails);
        // Find existing appointment to get patient ID
        Appointment existing = appointmentService.getAllAppointments().stream()
                .filter(a -> a.getId().equals(appointmentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        AppointmentRequest followUpReq = new AppointmentRequest();
        followUpReq.setDoctorId(doctorId);
        followUpReq.setPatientId(existing.getPatient().getId());
        followUpReq.setDate(slot.getEffectiveDate());
        followUpReq.setTime(slot.getEffectiveTime());

        return appointmentService.createAppointment(followUpReq, userDetails);
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public Doctor getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long doctorId = resolveDoctorId(userDetails);
        return doctorService.getDoctorById(doctorId);
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public Doctor updateProfile(
            @RequestBody Doctor changes,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long doctorId = resolveDoctorId(userDetails);
        return doctorService.updateDoctor(doctorId, changes);
    }

    private Long resolveDoctorId(CustomUserDetails userDetails) {
        if (userDetails.getDoctorId() != null) {
            return userDetails.getDoctorId();
        }
        // Fallback for ADMIN impersonating or testing
        List<Doctor> doctors = doctorService.getAllDoctors();
        if (!doctors.isEmpty()) {
            return doctors.get(0).getId();
        }
        throw new ResourceNotFoundException("No doctor associated with this account.");
    }
}
