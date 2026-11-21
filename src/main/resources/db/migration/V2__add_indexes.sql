-- ==========================================================
-- Flyway Migration V2: Performance Indexes on Query Columns
-- ==========================================================

-- 1. Patient Indexes
CREATE INDEX IF NOT EXISTS idx_patient_phone ON patient(phone);
CREATE INDEX IF NOT EXISTS idx_patient_name ON patient(name);

-- 2. Doctor Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON doctor(specialization);

-- 3. Appointments Indexes (frequently queried by doctor, date, time, and patient)
CREATE INDEX IF NOT EXISTS idx_appointment_doctor_date_time ON appointments(doctor_id, date, time);
CREATE INDEX IF NOT EXISTS idx_appointment_patient_status ON appointments(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_appointment_date_status ON appointments(date, status);

-- 4. Billing Indexes
CREATE INDEX IF NOT EXISTS idx_bills_invoice_num ON bills(invoice_number);
CREATE INDEX IF NOT EXISTS idx_bills_patient_status ON bills(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- 5. Medical Records Indexes
CREATE INDEX IF NOT EXISTS idx_medical_record_patient ON medical_record(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_record_doctor ON medical_record(doctor_id, created_at DESC);

-- 6. Audit Log Indexes (frequently queried by admin with timestamp & filters)
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_action ON audit_log(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, entity_id);

-- 7. App Users & Refresh Tokens
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
