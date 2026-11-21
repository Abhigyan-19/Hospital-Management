package com.hospital.management.patient.service;

import com.hospital.management.appointment.repository.AppointmentRepository;
import com.hospital.management.patient.dto.LinkedPatientRequest;
import com.hospital.management.patient.dto.PatientRequest;
import com.hospital.management.patient.dto.PatientResponse;
import com.hospital.management.patient.entity.Patient;
import com.hospital.management.patient.repository.PatientRepository;
import com.hospital.management.security.AuthenticatedUser;
import com.hospital.management.security.UserAccount;
import com.hospital.management.security.UserAccountRepository;
import com.hospital.management.security.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PatientService {
    private final PatientRepository patientRepository;
    private final UserAccountRepository userAccountRepository;
    private final AppointmentRepository appointmentRepository;

    public PatientService(
            PatientRepository patientRepository,
            UserAccountRepository userAccountRepository,
            AppointmentRepository appointmentRepository) {
        this.patientRepository = patientRepository;
        this.userAccountRepository = userAccountRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream().map(PatientResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        return PatientResponse.from(getPatient(id));
    }

    @Transactional
    public PatientResponse createStaffPatient(PatientRequest request) {
        Patient patient = new Patient(request.name().trim(), request.age(), request.gender().trim(), request.phone());
        return PatientResponse.from(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getLinkedPatients(AuthenticatedUser user) {
        requirePatient(user);
        return patientRepository.findByOwnerAccount_IdOrderByIdAsc(user.id())
                .stream().map(PatientResponse::from).toList();
    }

    @Transactional
    public PatientResponse addLinkedPatient(AuthenticatedUser user, LinkedPatientRequest request) {
        requirePatient(user);
        UserAccount owner = userAccountRepository.findById(user.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account is no longer available."));
        Patient patient = new Patient(
                request.name().trim(),
                request.age(),
                request.gender().trim(),
                request.phone() == null ? null : request.phone().trim());
        patient.setOwnerAccount(owner);
        patient.setRelationshipToAccount(request.relationship().trim());
        return PatientResponse.from(patientRepository.save(patient));
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = getPatient(id);
        if (appointmentRepository.existsByPatient_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patients with appointment history cannot be deleted.");
        }
        patientRepository.delete(patient);
    }

    private Patient getPatient(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found."));
    }

    private void requirePatient(AuthenticatedUser user) {
        if (user.role() != UserRole.PATIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patient accounts can manage linked profiles.");
        }
    }
}
