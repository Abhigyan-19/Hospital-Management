package com.hospital.management.config;

import com.hospital.management.entity.*;
import com.hospital.management.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initDemoData(
            DepartmentRepository departmentRepository,
            DoctorRepository doctorRepository,
            DoctorAvailabilityRepository availabilityRepository,
            PatientRepository patientRepository,
            WardRepository wardRepository,
            BedRepository bedRepository,
            AppointmentRepository appointmentRepository,
            MedicalRecordRepository medicalRecordRepository,
            BillRepository billRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            // 1. Seed Departments if empty
            if (departmentRepository.count() == 0) {
                departmentRepository.save(new Department("Cardiology", "Dr. Anika Sharma", "Comprehensive cardiovascular diagnostics and inpatient monitoring."));
                departmentRepository.save(new Department("Neurology", "Dr. Rajesh Mukherjee", "Advanced clinical neurology, neurophysiology, and stroke care."));
                departmentRepository.save(new Department("Pediatrics", "Dr. Priya Nambiar", "Pediatric outpatient, neonatal care, and routine immunization."));
                departmentRepository.save(new Department("Orthopedics", "Dr. Vikramaditya Sen", "Joint replacement, trauma surgery, and musculoskeletal rehabilitation."));
                departmentRepository.save(new Department("General Medicine", "Dr. Arindam Das", "Primary care, adult infectious diseases, and internal medicine."));
                log.info("Initialized default departments.");
            }

            // 2. Seed Doctors if empty
            Doctor docCardio;
            Doctor docNeuro;
            if (doctorRepository.count() == 0) {
                docCardio = doctorRepository.save(new Doctor("Dr. Anika Sharma", "Cardiology", 14));
                docNeuro = doctorRepository.save(new Doctor("Dr. Rajesh Mukherjee", "Neurology", 18));
                doctorRepository.save(new Doctor("Dr. Priya Nambiar", "Pediatrics", 9));
                doctorRepository.save(new Doctor("Dr. Vikramaditya Sen", "Orthopedics", 15));
                doctorRepository.save(new Doctor("Dr. Arindam Das", "General Medicine", 12));
                log.info("Initialized default doctors.");
            } else {
                List<Doctor> docs = doctorRepository.findAll();
                docCardio = docs.get(0);
                docNeuro = docs.size() > 1 ? docs.get(1) : docCardio;
            }

            // 3. Seed Doctor Availability
            if (availabilityRepository.findByDoctor_Id(docCardio.getId()).isEmpty()) {
                DoctorAvailability av = new DoctorAvailability(
                        docCardio,
                        "Monday,Tuesday,Wednesday,Thursday,Friday",
                        "09:00",
                        "17:00",
                        30,
                        ""
                );
                availabilityRepository.save(av);
            }

            // 4. Seed Patients
            Patient samplePatient;
            Patient patientBanerjee;
            if (patientRepository.count() == 0) {
                samplePatient = new Patient("Maya Iyer", 28, "Female", "+91 9876543210", "O+", "Penicillin");
                samplePatient.setEmergencyContact("+91 9876500001");
                samplePatient = patientRepository.save(samplePatient);

                patientBanerjee = new Patient("Rahul Banerjee", 42, "Male", "+91 9830112233", "B+", "Sulfa drugs");
                patientBanerjee.setEmergencyContact("+91 9830112200");
                patientBanerjee = patientRepository.save(patientBanerjee);

                Patient p3 = new Patient("Sunita Sen", 65, "Female", "+91 9831223344", "A+", "None known");
                p3.setEmergencyContact("+91 9831223300");
                patientRepository.save(p3);
                log.info("Initialized default patients.");
            } else {
                List<Patient> pts = patientRepository.findAll();
                samplePatient = pts.get(0);
                patientBanerjee = pts.size() > 1 ? pts.get(1) : samplePatient;
            }

            // 5. Seed Wards & Beds
            if (wardRepository.count() == 0) {
                Ward ccu = wardRepository.save(new Ward("Cardiac Care Unit (CCU)", "Cardiology", 2));
                Ward icu = wardRepository.save(new Ward("Intensive Care Unit (ICU)", "General Medicine", 3));
                Ward gmw = wardRepository.save(new Ward("General Medical Ward", "General Medicine", 1));

                bedRepository.save(new Bed("CCU-01", BedStatus.OCCUPIED, ccu, patientBanerjee));
                bedRepository.save(new Bed("CCU-02", BedStatus.AVAILABLE, ccu, null));
                bedRepository.save(new Bed("ICU-01", BedStatus.AVAILABLE, icu, null));
                bedRepository.save(new Bed("GMW-01", BedStatus.AVAILABLE, gmw, null));
                log.info("Initialized default wards and beds.");
            }

            // 6. Seed Appointments
            if (appointmentRepository.count() == 0) {
                Appointment a1 = new Appointment(samplePatient, docCardio, "2026-11-20", "10:00", "Completed");
                appointmentRepository.save(a1);

                Appointment a2 = new Appointment(patientBanerjee, docCardio, "2026-11-21", "11:00", "Completed");
                appointmentRepository.save(a2);

                Appointment a3 = new Appointment(samplePatient, docCardio, "2026-11-25", "09:30", "Scheduled");
                appointmentRepository.save(a3);
                log.info("Initialized default appointments.");
            }

            // 7. Seed Medical Record
            if (medicalRecordRepository.count() == 0) {
                MedicalRecord record = new MedicalRecord(
                        samplePatient,
                        docCardio,
                        null,
                        "Essential Hypertension (Stage 1)",
                        "Occasional headaches and elevated resting systolic blood pressure",
                        "BP: 138/88 mmHg, Pulse: 76 bpm, Temp: 98.4 F, SpO2: 99%",
                        "Recommended lifestyle modification, DASH diet, sodium reduction, and 30 minutes daily aerobic exercise."
                );
                medicalRecordRepository.save(record);
            }

            // 8. Seed Itemized Bill
            if (billRepository.count() == 0) {
                Bill bill = new Bill();
                bill.setInvoiceNumber("INV-1001");
                bill.setPatient(samplePatient);
                bill.setDescription("Cardiology consultation and baseline diagnostics");
                bill.setStatus("PAID");
                bill.setPaymentMethod("UPI");
                bill.setPaidAt(LocalDateTime.now().minusHours(2));
                bill.setCreatedAt(LocalDateTime.now().minusHours(3));
                bill.setTaxRate(0.18);

                bill.addItem(new BillItem(bill, "Specialist Doctor Consultation", 1, 500.00));
                bill.addItem(new BillItem(bill, "12-Lead Electrocardiogram (ECG)", 1, 600.00));
                bill.addItem(new BillItem(bill, "Complete Blood Count (CBC) Panel", 1, 400.00));

                double subtotal = 1500.00;
                double tax = 270.00;
                bill.setSubtotal(subtotal);
                bill.setTaxAmount(tax);
                bill.setAmount(1770.00);

                billRepository.save(bill);
            }

            // 9. Seed Default Application Users (Password: demo123)
            if (userRepository.count() == 0) {
                String defaultPassword = passwordEncoder.encode("demo123");

                // Admin
                User admin = new User("admin@sebasethu.health", defaultPassword, "Hospital Administrator", Role.ADMIN);
                admin.setApprovalStatus("APPROVED");
                userRepository.save(admin);

                // Doctor
                User doctorUser = new User("doctor@sebasethu.health", defaultPassword, docCardio.getName(), Role.DOCTOR);
                doctorUser.setDoctorId(docCardio.getId());
                doctorUser.setApprovalStatus("APPROVED");
                userRepository.save(doctorUser);

                // Patient
                User patientUser = new User("patient@sebasethu.health", defaultPassword, samplePatient.getName(), Role.PATIENT);
                patientUser.setPatientId(samplePatient.getId());
                patientUser.setApprovalStatus("APPROVED");
                userRepository.save(patientUser);

                // Receptionist
                User reception = new User("reception@sebasethu.health", defaultPassword, "Reception Team", Role.RECEPTIONIST);
                reception.setApprovalStatus("APPROVED");
                userRepository.save(reception);

                log.info("Initialized default users for ADMIN, DOCTOR, PATIENT, and RECEPTIONIST.");
            }
        };
    }
}
