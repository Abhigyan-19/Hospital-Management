-- Migration V3: Patient Visit History table and automatic Completion Trigger

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

-- Trigger function: Automatically snapshots visit details when appointment is completed
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
        FROM patients p
        LEFT JOIN doctors d ON d.id = NEW.doctor_id
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
