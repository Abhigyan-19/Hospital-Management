package com.hospital.management.service;

import com.hospital.management.entity.Appointment;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorService(DoctorRepository doctorRepository, AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public Doctor updateDoctor(Long id, Doctor changes) {
        Doctor doctor = getDoctorById(id);
        if (changes.getName() != null && !changes.getName().isBlank()) {
            doctor.setName(changes.getName());
        }
        if (changes.getSpecialization() != null && !changes.getSpecialization().isBlank()) {
            doctor.setSpecialization(changes.getSpecialization());
        }
        if (changes.getExperience() > 0) {
            doctor.setExperience(changes.getExperience());
        }
        return doctorRepository.save(doctor);
    }

    public List<Patient> getAssignedPatients(Long doctorId, String search) {
        List<Appointment> appointments = appointmentRepository.findByDoctor_Id(doctorId);
        Map<Long, Patient> uniquePatients = new LinkedHashMap<>();

        for (Appointment a : appointments) {
            if (a.getPatient() != null) {
                uniquePatients.putIfAbsent(a.getPatient().getId(), a.getPatient());
            }
        }

        if (search == null || search.isBlank()) {
            return new ArrayList<>(uniquePatients.values());
        }

        String filter = search.trim().toLowerCase();
        return uniquePatients.values().stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(filter)) ||
                             (p.getPhone() != null && p.getPhone().contains(filter)))
                .collect(Collectors.toList());
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }
}
