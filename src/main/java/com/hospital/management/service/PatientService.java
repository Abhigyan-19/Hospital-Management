package com.hospital.management.service;

import com.hospital.management.entity.Patient;
import com.hospital.management.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {
// @Service tells spring that this is a service or business logic. create and manage an object of this class
// so basically , spring creates PatientService object => keeps it is spring container.
// so I don't need to write
// PatientService service = new PatientService(..);
// Spring handles it.

    private final PatientRepository patientRepository;
// this service needs the repo because the repo is responsible for communicating of the database.
// this is constructor dependency injection.
// PatientService needs a PatientRepository to work.
// SPring sees and provides the repo automatically.

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // Create patient
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // Get all patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // Get patient by ID
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElse(null);
    }

    // Delete patient
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}