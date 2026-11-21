package com.hospital.management.config;

import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.Role;
import com.hospital.management.entity.User;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.repository.UserRepository;
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
                                       PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                String defaultPassword = passwordEncoder.encode("demo123");

                // 1. Admin
                User admin = new User("admin@sebasethu.health", defaultPassword, "Hospital Administrator", Role.ADMIN);
                admin.setApprovalStatus("APPROVED");
                userRepository.save(admin);

                // 2. Doctor
                List<Doctor> doctors = doctorRepository.findAll();
                Doctor sampleDoctor;
                if (!doctors.isEmpty()) {
                    sampleDoctor = doctors.get(0);
                } else {
                    sampleDoctor = doctorRepository.save(new Doctor("Dr. Anika Sharma", "Cardiology", 10));
                }
                User doctorUser = new User("doctor@sebasethu.health", defaultPassword, sampleDoctor.getName(), Role.DOCTOR);
                doctorUser.setDoctorId(sampleDoctor.getId());
                doctorUser.setApprovalStatus("APPROVED");
                userRepository.save(doctorUser);

                // 3. Patient
                List<Patient> patients = patientRepository.findAll();
                Patient samplePatient;
                if (!patients.isEmpty()) {
                    samplePatient = patients.get(0);
                } else {
                    samplePatient = patientRepository.save(new Patient("Maya Iyer", 28, "Female", "+91 9876543210"));
                }
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
