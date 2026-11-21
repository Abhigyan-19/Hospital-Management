-- ==========================================================
-- PostgreSQL Database Initialization Script for Neon.tech
-- Project: Hospital Management System (Sebasethu Hospital)
-- ==========================================================

-- Clean up existing tables if re-initializing
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS medical_record CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
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
    phone VARCHAR(50),
    blood_group VARCHAR(20),
    allergies VARCHAR(500),
    emergency_contact VARCHAR(100)
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
    patient_instructions VARCHAR(500),
    prescription_id BIGINT NOT NULL,
    CONSTRAINT fk_pm_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 9. Bills Table
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    subtotal NUMERIC(10, 2),
    tax_rate NUMERIC(5, 4) DEFAULT 0.18,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
);

-- 9b. Bill Items Table (Itemized Billing)
CREATE TABLE bill_items (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_bill_items_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
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

-- 11. Application Users Table (Spring Security & RBAC)
CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    doctor_id BIGINT REFERENCES doctor(id) ON DELETE SET NULL,
    patient_id BIGINT REFERENCES patient(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 13. Audit Log Table
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    actor_name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    summary TEXT,
    ip_address VARCHAR(100),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Medical Record Table (Clinical Depth)
CREATE TABLE medical_record (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    appointment_id BIGINT REFERENCES appointments(id) ON DELETE SET NULL,
    diagnosis VARCHAR(255) NOT NULL,
    symptoms TEXT,
    vitals TEXT,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Doctor Availability Table
CREATE TABLE doctor_availability (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL UNIQUE REFERENCES doctor(id) ON DELETE CASCADE,
    working_days VARCHAR(500) DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday',
    start_time VARCHAR(10) DEFAULT '09:00',
    end_time VARCHAR(10) DEFAULT '17:00',
    slot_minutes INTEGER DEFAULT 30,
    leave_dates VARCHAR(1000)
);


-- 16. Patient Visit History Table
CREATE TABLE IF NOT EXISTS patient_visit_history (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50),
    doctor_id BIGINT,
    doctor_name VARCHAR(255),
    doctor_specialization VARCHAR(255),
    appointment_id BIGINT,
    visit_date VARCHAR(50),
    visit_time VARCHAR(50),
    diagnosis TEXT,
    symptoms TEXT,
    treatment_notes TEXT,
    prescriptions_summary TEXT,
    vitals TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pvh_patient ON patient_visit_history(patient_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pvh_search_name ON patient_visit_history(patient_name);
CREATE INDEX IF NOT EXISTS idx_pvh_search_phone ON patient_visit_history(patient_phone);

-- Trigger: Automatically archive patient visit history upon appointment completion
CREATE OR REPLACE FUNCTION trg_fn_archive_patient_visit_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed')) THEN
        INSERT INTO patient_visit_history (
            patient_id,
            patient_name,
            patient_phone,
            doctor_id,
            doctor_name,
            doctor_specialization,
            appointment_id,
            visit_date,
            visit_time,
            diagnosis,
            treatment_notes,
            completed_at
        )
        SELECT
            p.id,
            p.name,
            p.phone,
            d.id,
            d.name,
            d.specialization,
            NEW.id,
            NEW.date,
            NEW.time,
            COALESCE(mr.diagnosis, 'Completed Visit'),
            COALESCE(mr.notes, 'Consultation completed'),
            CURRENT_TIMESTAMP
        FROM patient p
        LEFT JOIN doctor d ON d.id = NEW.doctor_id
        LEFT JOIN medical_record mr ON mr.appointment_id = NEW.id
        WHERE p.id = NEW.patient_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointment_visit_completed ON appointments;
CREATE TRIGGER trg_appointment_visit_completed
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION trg_fn_archive_patient_visit_history();
