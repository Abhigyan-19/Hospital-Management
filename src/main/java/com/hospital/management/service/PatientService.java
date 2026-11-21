package com.hospital.management.service;

import com.hospital.management.dto.PatientProfileDto;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.Role;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    @Transactional
    public Patient updatePatient(Long id, Patient updatedData, CustomUserDetails userDetails) {
        Patient patient = getPatientById(id);

        if (userDetails != null && userDetails.getUser().getRole() == Role.PATIENT) {
            if (userDetails.getPatientId() == null || !userDetails.getPatientId().equals(id)) {
                throw new AccessDeniedException("Patients can only update their own profile.");
            }
        }

        if (updatedData.getName() != null && !updatedData.getName().isBlank()) {
            patient.setName(updatedData.getName());
        }
        if (updatedData.getAge() > 0) {
            patient.setAge(updatedData.getAge());
        }
        if (updatedData.getGender() != null) {
            patient.setGender(updatedData.getGender());
        }
        if (updatedData.getPhone() != null) {
            patient.setPhone(updatedData.getPhone());
        }
        if (updatedData.getBloodGroup() != null) {
            patient.setBloodGroup(updatedData.getBloodGroup());
        }
        if (updatedData.getAllergies() != null) {
            patient.setAllergies(updatedData.getAllergies());
        }
        if (updatedData.getEmergencyContact() != null) {
            patient.setEmergencyContact(updatedData.getEmergencyContact());
        }

        return patientRepository.save(patient);
    }

    public List<PatientProfileDto> getLinkedProfiles(CustomUserDetails userDetails) {
        if (userDetails == null) {
            return List.of();
        }

        List<PatientProfileDto> result = new ArrayList<>();
        Long patientId = userDetails.getPatientId();

        if (patientId != null) {
            patientRepository.findById(patientId).ifPresent(p -> {
                PatientProfileDto dto = toProfileDto(p, true, "SELF");
                result.add(dto);
            });
        } else if (userDetails.getUser().getRole() == Role.ADMIN) {
            // For admin, return all patients
            for (Patient p : patientRepository.findAll()) {
                result.add(toProfileDto(p, false, "PATIENT"));
            }
        }

        return result;
    }

    private PatientProfileDto toProfileDto(Patient p, boolean isSelf, String relationship) {
        PatientProfileDto dto = new PatientProfileDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setAge(p.getAge());
        dto.setGender(p.getGender());
        dto.setPhone(p.getPhone());
        dto.setBloodGroup(p.getBloodGroup());
        dto.setAllergies(p.getAllergies());
        dto.setEmergencyContact(p.getEmergencyContact());
        dto.setSelf(isSelf);
        dto.setRelationshipToAccount(relationship);
        return dto;
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }
}
