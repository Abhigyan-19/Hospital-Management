-- ==========================================================
-- PostgreSQL Database Initialization Script for Neon.tech
-- Project: Hospital Management System (Sebasethu Hospital)
-- ==========================================================

-- Clean up existing tables if re-initializing
DROP TABLE IF EXISTS sms_notification CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS prescription_medicines CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS bed CASCADE;
DROP TABLE IF EXISTS ward CASCADE;
DROP TABLE IF EXISTS department CASCADE;
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

-- 3. Departments Table
CREATE TABLE department (
    id BIGSERIAL PRIMARY KEY,
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

-- 9. Bills Table
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);

-- 10. SMS Notification Log Table
CREATE TABLE sms_notification (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT,
    sender_phone VARCHAR(15) NOT NULL DEFAULT '+91 7890100849',
    recipient_phone VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sms_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL
);
