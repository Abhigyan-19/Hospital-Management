-- ==========================================================
-- SEBASETHU HOSPITAL MANAGEMENT SYSTEM
-- Demo Seed Data Script (database/seed_demo_data.sql)
-- ==========================================================

-- 1. Seed Departments
INSERT INTO department (name, head_doctor, description) VALUES
('Cardiology', 'Dr. Anika Sharma', 'Comprehensive cardiovascular diagnostics, interventional cardiology, and inpatient cardiac monitoring.'),
('Neurology', 'Dr. Rajesh Mukherjee', 'Advanced clinical neurology, stroke intervention, neurophysiology, and seizure management.'),
('Pediatrics', 'Dr. Priya Nambiar', 'Pediatric outpatient, neonatal care, developmental milestones, and routine immunization.'),
('Orthopedics', 'Dr. Vikramaditya Sen', 'Joint replacement, trauma surgery, arthroscopy, and musculoskeletal rehabilitation.'),
('General Medicine', 'Dr. Arindam Das', 'Primary care, adult infectious diseases, chronic disease management, and internal medicine.')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Doctors
INSERT INTO doctor (name, specialization, experience) VALUES
('Dr. Anika Sharma', 'Cardiology', 14),
('Dr. Rajesh Mukherjee', 'Neurology', 18),
('Dr. Priya Nambiar', 'Pediatrics', 9),
('Dr. Vikramaditya Sen', 'Orthopedics', 15),
('Dr. Arindam Das', 'General Medicine', 12)
ON CONFLICT DO NOTHING;

-- 3. Seed Doctor Availability
INSERT INTO doctor_availability (doctor_id, working_days, start_time, end_time, slot_minutes, leave_dates) VALUES
(1, 'Monday,Tuesday,Wednesday,Thursday,Friday', '09:00', '17:00', 30, '2026-12-25'),
(2, 'Monday,Wednesday,Friday,Saturday', '10:00', '16:00', 30, ''),
(3, 'Monday,Tuesday,Wednesday,Thursday,Friday', '09:30', '15:30', 20, ''),
(4, 'Tuesday,Thursday,Saturday', '11:00', '18:00', 30, ''),
(5, 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', '08:30', '16:30', 15, '')
ON CONFLICT (doctor_id) DO NOTHING;

-- 4. Seed Patients
INSERT INTO patient (name, age, gender, phone, blood_group, allergies, emergency_contact) VALUES
('Maya Iyer', 28, 'Female', '+91 9876543210', 'O+', 'Penicillin', '+91 9876500001'),
('Rahul Banerjee', 42, 'Male', '+91 9830112233', 'B+', 'Sulfa drugs', '+91 9830112200'),
('Sunita Sen', 65, 'Female', '+91 9831223344', 'A+', 'None known', '+91 9831223300'),
('Arjun Kapoor', 34, 'Male', '+91 9820334455', 'O-', 'Aspirin, NSAIDs', '+91 9820334400'),
('Rohan Das', 8, 'Male', '+91 9845445566', 'AB+', 'Peanuts', '+91 9845445500')
ON CONFLICT DO NOTHING;

-- 5. Seed Wards
INSERT INTO ward (name, department, floor) VALUES
('Cardiac Care Unit (CCU)', 'Cardiology', 2),
('Intensive Care Unit (ICU)', 'General Medicine', 3),
('Pediatric Care Ward', 'Pediatrics', 1),
('Orthopedic Recovery Ward', 'Orthopedics', 4),
('General Medical Ward A', 'General Medicine', 2)
ON CONFLICT (name) DO NOTHING;

-- 6. Seed Beds
INSERT INTO bed (bed_number, status, ward_id, patient_id) VALUES
('CCU-01', 'OCCUPIED', 1, 2),
('CCU-02', 'AVAILABLE', 1, NULL),
('CCU-03', 'AVAILABLE', 1, NULL),
('ICU-01', 'AVAILABLE', 2, NULL),
('ICU-02', 'AVAILABLE', 2, NULL),
('PED-01', 'OCCUPIED', 3, 5),
('PED-02', 'AVAILABLE', 3, NULL),
('ORTHO-01', 'AVAILABLE', 4, NULL),
('GMW-01', 'OCCUPIED', 5, 3),
('GMW-02', 'AVAILABLE', 5, NULL)
ON CONFLICT DO NOTHING;

-- 7. Seed Appointments
INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES
(1, 1, '2026-11-20', '10:00', 'Completed'),
(2, 1, '2026-11-21', '11:00', 'Completed'),
(3, 2, '2026-11-22', '14:15', 'Confirmed'),
(4, 4, '2026-11-23', '11:30', 'Scheduled'),
(1, 1, '2026-11-25', '09:30', 'Scheduled'),
(5, 3, '2026-11-19', '10:30', 'Cancelled')
ON CONFLICT DO NOTHING;

-- 8. Seed Medical Records
INSERT INTO medical_record (patient_id, doctor_id, appointment_id, diagnosis, symptoms, vitals, notes, created_at) VALUES
(1, 1, 1, 'Essential Hypertension (Stage 1)', 'Mild episodic occipital headaches, exertional fatigue', 'BP: 138/88 mmHg, Pulse: 76 bpm, Temp: 98.4 F, SpO2: 99%', 'Advised dietary DASH protocol, sodium reduction (<2g/day), and 30 min brisk walk daily. Re-check in 4 weeks.', '2026-11-20 10:45:00'),
(2, 1, 2, 'Stable Angina Pectoris', 'Substernal chest tightness on heavy exertion, radiating to left shoulder, relieved with rest', 'BP: 142/90 mmHg, Pulse: 82 bpm, Temp: 98.6 F, SpO2: 97%', 'ECG demonstrated normal sinus rhythm with non-specific ST-T changes. Scheduled outpatient treadmill stress test and lipid profile.', '2026-11-21 11:30:00')
ON CONFLICT DO NOTHING;

-- 9. Seed Prescriptions & Prescription Medicines
INSERT INTO prescriptions (id, patient_id, doctor_id, notes, created_at) VALUES
(1, 1, 1, 'Take with water after meals. Monitor morning resting BP.', '2026-11-20 10:45:00'),
(2, 2, 1, 'Do not discontinue antiplatelet therapy abruptly. Avoid heavy lifting.', '2026-11-21 11:30:00')
ON CONFLICT DO NOTHING;

INSERT INTO prescription_medicines (name, dosage, frequency, duration, patient_instructions, prescription_id) VALUES
('Telmisartan 40mg', '1 tablet', 'Once daily (Morning)', '30 days', 'Take 1 tablet after breakfast with water', 1),
('Aspirin 75mg (Enteric-coated)', '1 tablet', 'Once daily (Night)', '30 days', 'Take 1 tablet immediately after dinner', 2),
('Atorvastatin 20mg', '1 tablet', 'Once daily (Night)', '30 days', 'Take at bedtime regularly', 2)
ON CONFLICT DO NOTHING;

-- 10. Seed Itemized Bills & Bill Items
INSERT INTO bills (id, invoice_number, patient_id, subtotal, tax_rate, tax_amount, amount, description, status, payment_method, paid_at, created_at) VALUES
(1, 'INV-1001', 1, 1500.00, 0.18, 270.00, 1770.00, 'Cardiology outpatient visit and diagnostic workup', 'PAID', 'UPI', '2026-11-20 11:00:00', '2026-11-20 10:50:00'),
(2, 'INV-1002', 2, 3200.00, 0.18, 576.00, 3776.00, 'CCU admission, monitoring, and cardiology specialist consultation', 'PAID', 'CARD', '2026-11-21 12:15:00', '2026-11-21 11:45:00'),
(3, 'INV-1003', 3, 800.00, 0.18, 144.00, 944.00, 'Neurology consultation fee', 'PENDING', NULL, NULL, '2026-11-21 15:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price) VALUES
(1, 'Specialist Cardiology Consultation', 1, 500.00, 500.00),
(1, '12-Lead Electrocardiogram (ECG)', 1, 600.00, 600.00),
(1, 'Complete Blood Count (CBC) Panel', 1, 400.00, 400.00),
(2, 'Cardiac Care Unit (CCU) Day Charge', 1, 2000.00, 2000.00),
(2, 'Senior Consultant Visit', 1, 800.00, 800.00),
(2, 'Biochemical Lipid Profile & Electrolytes', 1, 400.00, 400.00),
(3, 'Neurology Initial Consultation', 1, 800.00, 800.00)
ON CONFLICT DO NOTHING;

-- 11. Seed SMS Notifications
INSERT INTO sms_notification (patient_id, sender_phone, recipient_phone, recipient_name, type, message, status, sent_at) VALUES
(1, '+91 7890100849', '+91 9876543210', 'Maya Iyer', 'BOOKING_CONFIRMATION', 'Hello Maya Iyer, your appointment with Dr. Anika Sharma (Cardiology) is confirmed for 2026-11-20 at 10:00. Helpline: +91 7890100849 - Sebasethu Hospital', 'SENT', '2026-11-19 14:00:00'),
(1, '+91 7890100849', '+91 9876543210', 'Maya Iyer', 'APPOINTMENT_COMPLETED', 'Hello Maya Iyer, your consultation with Dr. Anika Sharma on 2026-11-20 is COMPLETED. For follow-up queries, contact +91 7890100849. - Sebasethu Hospital', 'SENT', '2026-11-20 10:45:00'),
(1, '+91 7890100849', '+91 9876543210', 'Maya Iyer', 'BILLING_INVOICE', 'Hello Maya Iyer, invoice INV-1001 for Rs. 1770.00 (Cardiology outpatient visit) status: PAID. Billing desk: +91 7890100849 - Sebasethu Hospital', 'SENT', '2026-11-20 11:00:00')
ON CONFLICT DO NOTHING;

-- 12. Seed Default Application Users (Password: demo123, BCrypt encoded)
INSERT INTO app_users (email, password, full_name, role, doctor_id, patient_id, active, approval_status) VALUES
('admin@sebasethu.health', '$2a$10$wKqKkVx26oQfK1tYjVf69uR49zQYgC4q7i431e459H33Y10q89mYm', 'Hospital Administrator', 'ADMIN', NULL, NULL, TRUE, 'APPROVED'),
('doctor@sebasethu.health', '$2a$10$wKqKkVx26oQfK1tYjVf69uR49zQYgC4q7i431e459H33Y10q89mYm', 'Dr. Anika Sharma', 'DOCTOR', 1, NULL, TRUE, 'APPROVED'),
('patient@sebasethu.health', '$2a$10$wKqKkVx26oQfK1tYjVf69uR49zQYgC4q7i431e459H33Y10q89mYm', 'Maya Iyer', 'PATIENT', NULL, 1, TRUE, 'APPROVED'),
('reception@sebasethu.health', '$2a$10$wKqKkVx26oQfK1tYjVf69uR49zQYgC4q7i431e459H33Y10q89mYm', 'Reception Desk', 'RECEPTIONIST', NULL, NULL, TRUE, 'APPROVED')
ON CONFLICT (email) DO NOTHING;
