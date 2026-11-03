-- ==========================================================
-- PostgreSQL Database Initialization Script for Neon.tech
-- Project: Hospital Management System (Sebasethu Hospital)
-- ==========================================================

-- Clean up existing tables if re-initializing
DROP TABLE IF EXISTS prescription_medicines CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS bed CASCADE;
DROP TABLE IF EXISTS ward CASCADE;
DROP TABLE IF EXISTS doctor CASCADE;
DROP TABLE IF EXISTS patient CASCADE;

-- 1. Patients Table
CREATE TABLE patient (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(50),
    phone VARCHAR(50)
);

-- 2. Doctors Table
CREATE TABLE doctor (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    experience INTEGER NOT NULL
);

-- 3. Wards Table
CREATE TABLE ward (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    floor INTEGER NOT NULL
);

-- 4. Beds Table
CREATE TABLE bed (
    id BIGSERIAL PRIMARY KEY,
    bed_number VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    ward_id BIGINT NOT NULL,
    patient_id BIGINT UNIQUE,
    CONSTRAINT fk_bed_ward FOREIGN KEY (ward_id) REFERENCES ward(id) ON DELETE CASCADE,
    CONSTRAINT fk_bed_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL,
    CONSTRAINT uq_ward_bed UNIQUE (ward_id, bed_number)
);

-- 5. Appointments Table
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    CONSTRAINT fk_app_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
);

-- 6. Prescriptions Table
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_presc_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_presc_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
);

-- 7. Prescription Medicines Table
CREATE TABLE prescription_medicines (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    prescription_id BIGINT NOT NULL,
    CONSTRAINT fk_pm_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- ==========================================================
-- Sample Data Seeding
-- ==========================================================

-- Insert Doctors
INSERT INTO doctor (name, specialization, experience) VALUES
('Dr. Arvind Sharma', 'Cardiology', 14),
('Dr. Priya Nair', 'Neurology', 9),
('Dr. Rajesh Menon', 'Orthopedics', 12),
('Dr. Ananya Roy', 'Pediatrics', 7),
('Dr. Vikram Patel', 'General Medicine', 15);

-- Insert Patients
INSERT INTO patient (name, age, gender, phone) VALUES
('Ramesh Kumar', 45, 'Male', '+91 9876543210'),
('Sunita Devi', 38, 'Female', '+91 9823456789'),
('Amit Verma', 29, 'Male', '+91 9712345678'),
('Meera Iyer', 62, 'Female', '+91 9654321987'),
('Rahul Sen', 19, 'Male', '+91 9543218765');

-- Insert Wards
INSERT INTO ward (name, department, floor) VALUES
('General Ward A', 'General Medicine', 1),
('ICU - Unit 1', 'Critical Care', 2),
('Cardiology Wing B', 'Cardiology', 3),
('Pediatric Care', 'Pediatrics', 2);

-- Insert Beds
INSERT INTO bed (bed_number, status, ward_id, patient_id) VALUES
('B101', 'OCCUPIED', 1, 1),
('B102', 'AVAILABLE', 1, NULL),
('B103', 'OCCUPIED', 1, 2),
('ICU-01', 'OCCUPIED', 2, 4),
('ICU-02', 'AVAILABLE', 2, NULL),
('CARD-201', 'AVAILABLE', 3, NULL),
('PED-301', 'OCCUPIED', 4, 5);

-- Insert Appointments
INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES
(1, 1, '2026-11-05', '10:00 AM', 'SCHEDULED'),
(2, 5, '2026-11-05', '11:30 AM', 'SCHEDULED'),
(3, 3, '2026-11-06', '02:00 PM', 'COMPLETED'),
(4, 2, '2026-11-06', '04:30 PM', 'SCHEDULED');

-- Insert Prescriptions
INSERT INTO prescriptions (patient_id, doctor_id, notes, created_at) VALUES
(1, 1, 'Patient showing symptoms of mild hypertension. Regular BP monitoring advised.', CURRENT_TIMESTAMP),
(3, 3, 'Post-fracture recovery plan. Follow physiotherapy routine.', CURRENT_TIMESTAMP);

-- Insert Prescription Medicines
INSERT INTO prescription_medicines (name, dosage, frequency, duration, prescription_id) VALUES
('Amlodipine', '5mg', 'Once daily in morning', '30 days', 1),
('Telmisartan', '40mg', 'Once daily with dinner', '30 days', 1),
('Calcium + Vitamin D3', '500mg', 'Twice daily after food', '15 days', 2),
('Paracetamol', '650mg', 'SOS (As needed for pain)', '5 days', 2);

