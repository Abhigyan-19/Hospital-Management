package com.hospital.management.config;

import com.hospital.management.entity.*;
import com.hospital.management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository,
                                       DoctorRepository doctorRepository,
                                       PatientRepository patientRepository,
                                       DoctorAvailabilityRepository availabilityRepository,
                                       MedicalRecordRepository medicalRecordRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed sample patient if none
            List<Patient> patients = patientRepository.findAll();
            Patient samplePatient;
            if (!patients.isEmpty()) {
                samplePatient = patients.get(0);
                if (samplePatient.getBloodGroup() == null) {
                    samplePatient.setBloodGroup("O+");
                    samplePatient.setAllergies("Penicillin");
                    samplePatient.setEmergencyContact("+91 9876500000");
                    patientRepository.save(samplePatient);
                }
            } else {
                samplePatient = new Patient("Maya Iyer", 28, "Female", "+91 9876543210", "O+", "Penicillin");
                samplePatient.setEmergencyContact("+91 9876500000");
                samplePatient = patientRepository.save(samplePatient);
            }

            // Seed sample doctor if none
            List<Doctor> doctors = doctorRepository.findAll();
            Doctor sampleDoctor;
            if (!doctors.isEmpty()) {
                sampleDoctor = doctors.get(0);
            } else {
                sampleDoctor = doctorRepository.save(new Doctor("Dr. Anika Sharma", "Cardiology", 10));
            }

            // Seed doctor availability if none
            if (availabilityRepository.findByDoctor_Id(sampleDoctor.getId()).isEmpty()) {
                DoctorAvailability availability = new DoctorAvailability(
                        sampleDoctor,
                        "Monday,Tuesday,Wednesday,Thursday,Friday",
                        "09:00",
                        "17:00",
                        30,
                        ""
                );
                availabilityRepository.save(availability);
            }

            // Seed initial medical record if none
            if (medicalRecordRepository.count() == 0) {
                MedicalRecord record = new MedicalRecord(
                        samplePatient,
                        sampleDoctor,
                        null,
                        "Mild hypertension",
                        "Occasional headaches and elevated resting systolic blood pressure",
                        "BP: 135/85 mmHg, Pulse: 74 bpm, Temp: 98.4 F",
                        "Recommended lifestyle modification, reduced sodium intake, and 30 minutes daily aerobic exercise."
                );
                medicalRecordRepository.save(record);
            }

            // Seed default users if table empty
            if (userRepository.count() == 0) {
                String defaultPassword = passwordEncoder.encode("demo123");

                // 1. Admin
                User admin = new User("admin@sebasethu.health", defaultPassword, "Hospital Administrator", Role.ADMIN);
                admin.setApprovalStatus("APPROVED");
                userRepository.save(admin);

                // 2. Doctor
                User doctorUser = new User("doctor@sebasethu.health", defaultPassword, sampleDoctor.getName(), Role.DOCTOR);
                doctorUser.setDoctorId(sampleDoctor.getId());
                doctorUser.setApprovalStatus("APPROVED");
                userRepository.save(doctorUser);

                // 3. Patient
                User patientUser = new User("patient@sebasethu.health", defaultPassword, samplePatient.getName(), Role.PATIENT);
                patientUser.setPatientId(samplePatient.getId());
                patientUser.setApprovalStatus("APPROVED");
                userRepository.save(patientUser);

                // 4. Receptionist
                User reception = new User("reception@sebasethu.health", defaultPassword, "Reception Team", Role.RECEPTIONIST);
                reception.setApprovalStatus("APPROVED");
                userRepository.save(reception);
            }
        };
    }
}
