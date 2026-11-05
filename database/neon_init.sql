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
DROP TABLE IF EXISTS department CASCADE;

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

-- 3. Departments Table
CREATE TABLE department (
    id sBIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    head_doctor VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- 4. Wards Table
CREATE TABLE ward (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    floor INTEGER NOT NULL
);

-- 5. Beds Table
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

-- 6. Appointments Table
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

-- 7. Prescriptions Table
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_presc_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_presc_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
);

-- 8. Prescription Medicines Table
CREATE TABLE prescription_medicines (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    prescription_id BIGINT NOT NULL,
    CONSTRAINT fk_pm_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);