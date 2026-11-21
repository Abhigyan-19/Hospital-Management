# Master Technical Presentation Blueprint: SEBASETHU Hospital Management System

This document provides a comprehensive, slide-by-slide technical specification and content repository for building an executive-to-deep-dive presentation on the **Hospital Management & Automated Telemetry System**.

---

## Presentation Metadata & Overview

- **Project Title:** SEBASETHU Intelligent Hospital Management & Automated Notification Platform
- **Presentation Type:** Full-Stack Technical Architecture & Engineering Defense
- **Target Audience:** Technical Evaluators, System Architects, Healthcare IT Leads
- **Primary Technical Anchors:** Java 21 (Spring Boot 3.x), React 18 (Vite), PostgreSQL (Neon Serverless), Render Cloud, Vercel Edge, Real-Time SMS Gateway.
- **Dedicated Hospital Sender / Helpline:** `+91 7890100849`

---

## System Architecture Diagram (Mermaid)

```mermaid
graph TD
    subgraph Clients["Presentation Layer (Vercel Edge SPA)"]
        UI_Admin["Admin Control Center"]
        UI_Doc["Doctor Clinical Portal"]
        UI_Rec["Reception Desk & Billing"]
        UI_Pat["Patient Records Portal"]
    end

    subgraph Gateway["Network & Edge Routing"]
        CORS["CORS Policy Filter (Wildcard / Allowed Patterns)"]
        SPA["Vercel SPA Rewrites (/index.html)"]
    end

    subgraph Backend["Application Layer (Spring Boot on Render)"]
        SEC["Auth & Controller Routing Layer"]
        SVC_Core["Clinical Services (Doctor, Patient, Dept)"]
        SVC_Ops["Operations (Appointments, Beds, Wards)"]
        SVC_Rx["Prescription & Medication Service"]
        SVC_Bill["Billing & Invoice Engine"]
        SVC_SMS["SmsService Telemetry Dispatcher"]
    end

    subgraph DataLayer["Persistence Layer (Neon Cloud PostgreSQL)"]
        DB[(Serverless PostgreSQL)]
        Pool["PgBouncer Connection Pooler"]
    end

    subgraph Telemetry["External Notification Channels"]
        SMS_Twilio["Twilio REST API"]
        SMS_Fast["Fast2SMS DLT Engine"]
        SMS_Mock["Mock In-Memory Simulator / Audit Store"]
    end

    Clients --> Gateway
    Gateway --> Backend
    Backend --> Pool
    Pool --> DB
    SVC_Ops --> SVC_SMS
    SVC_Rx --> SVC_SMS
    SVC_Bill --> SVC_SMS
    SVC_SMS --> Telemetry
```

---

## Slide-by-Slide Detailed Blueprint

```carousel
### SLIDE 1: Title & Vision
**Headline:** SEBASETHU: Modern Healthcare Operations Platform
**Subtitle:** Cloud-Native Architecture, Automated Patient Telemetry, and Zero-Friction Clinical Workflow
- **Presenter:** Engineering Team
- **Stack Summary:** Spring Boot 3 · Java 21 · React 18 · Neon PostgreSQL · Render · Vercel
- **Core Value Proposition:** Transitioning hospitals from disconnected, paper-driven operations into an event-driven, paperless, real-time notified ecosystem.
<!-- slide -->
### SLIDE 2: Problem Statement & Industry Context
**Headline:** The Clinical Communication & Operations Gap
**Key Challenges Addressed:**
1. **Communication Asymmetry:** Patients miss consultations, bed transfers, and billing statuses due to lack of direct, automated SMS alerts.
2. **Data Fragmentation:** Departments, bed occupancy, doctor allocations, and billing frequently live in disparate silos.
3. **Deployment Fragility:** Monoliths deployed on static infrastructure face cold-start, scaling, and database connectivity bottlenecks.
4. **Auditability Deficits:** Inability to inspect real-time message dispatch logs, resulting in dispute resolution overhead.
<!-- slide -->
### SLIDE 3: High-Level Solution Architecture
**Headline:** Decoupled Cloud-Native Topology
- **Client Tier:** Single Page Application (SPA) built with React 18 and Vite, deployed globally across Vercel's Edge Network.
- **Service Tier:** Containerized Spring Boot 3.x micro-service runtime packaged via Docker multi-stage builds on Render.
- **Data Tier:** Fully managed, auto-scaling PostgreSQL database hosted on Neon.tech with PgBouncer connection pooling.
- **Messaging / Telemetry Tier:** Dual-mode notification pipeline (Live SMS provider fallback with automated audit persistence).
<!-- slide -->
### SLIDE 4: Database Schema & Entity Relationships
**Headline:** Relational Integrity on PostgreSQL (Neon.tech)
- **10 Core Tables:**
  - `department` (id, name, head_doctor, description)
  - `doctor` (id, name, specialization, phone, department_id)
  - `patient` (id, name, age, gender, phone, email, assigned_doctor_id)
  - `ward` & `bed` (ward_type, bed_number, status [AVAILABLE/OCCUPIED/MAINTENANCE])
  - `appointments` (date, time, status [SCHEDULED/COMPLETED/CANCELLED])
  - `prescriptions` & `prescription_medicines` (dosage, frequency, duration, instructions)
  - `bills` (invoice_number, amount, status [PENDING/PAID], timestamp)
  - `sms_notification` (recipient, sender, message, event_type, status, timestamp)
<!-- slide -->
### SLIDE 5: Real-Time Automated SMS Notification Pipeline
**Headline:** Zero-Friction Patient Telemetry
- **Official Hospital Helpline / Sender:** `+91 7890100849`
- **Supported Providers:** Fast2SMS (India DLT), Twilio (International), and Simulator/Audit mode.
- **Trigger Points:**
  1. *Appointment Scheduled:* Confirms date, time, and doctor.
  2. *Appointment Completed:* Marks closure, issues care follow-up.
  3. *Bed/Ward Assignment:* Details ward name, bed code, and nursing station.
  4. *Doctor Prescription:* Transmits medication regimen and dosage instructions.
  5. *Invoice / Billing:* Delivers invoice ID, total due, and payment receipt confirmations.
<!-- slide -->
### SLIDE 6: Role-Based Access Control (RBAC) & Portals
**Headline:** Multi-Tenant Role Isolation
- **Administrator Portal:** System metrics, department management, doctor verification, global audit logs.
- **Doctor Clinical Portal:** Patient roster, appointment queues, clinical consultation notes, electronic prescription generator.
- **Reception Desk:** Inpatient admissions, bed matrix, live slot booking, invoice generation, payment clearance.
- **Patient Self-Service:** Appointment timeline, medication history, invoice downloads.
<!-- slide -->
### SLIDE 7: DevOps & Production Deployment Pipeline
**Headline:** Enterprise Deployment Architecture
- **Backend on Render:** Multi-stage Docker build utilizing Eclipse Temurin JDK 21 Alpine image; memory-optimized JVM configuration.
- **Frontend on Vercel:** Continuous integration with Git push webhooks; custom `vercel.json` SPA catch-all rewrite engine.
- **Database Connection Sanitization:** Custom `DatabaseConfig.java` to dynamically parse and strip embedded URL credentials into standard PostgreSQL JDBC formats.
- **Security & CORS:** Global Spring `CorsConfiguration` supporting origin patterns for local testing and production Vercel domains.
```

---

## Detailed Data Breakdown by Functional Domain

### 1. Database Schema Specification (DDL Reference)

Here are the exact table structures implemented in the live PostgreSQL instance on Neon:

```sql
-- 1. Departments Table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    head_doctor VARCHAR(100),
    description TEXT
);

-- 2. Doctors Table
CREATE TABLE doctor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department_id INT REFERENCES department(id) ON DELETE SET NULL
);

-- 3. Patients Table
CREATE TABLE patient (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    assigned_doctor_id INT REFERENCES doctor(id) ON DELETE SET NULL
);

-- 4. Wards and Beds
CREATE TABLE ward (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE bed (
    id SERIAL PRIMARY KEY,
    bed_number VARCHAR(50) NOT NULL UNIQUE,
    ward_id INT NOT NULL REFERENCES ward(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    patient_id INT REFERENCES patient(id) ON DELETE SET NULL
);

-- 5. Appointments
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
);

-- 6. Prescriptions and Medicines
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_medicines (
    id SERIAL PRIMARY KEY,
    prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    patient_instructions TEXT
);

-- 7. Billing
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    patient_id INT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. SMS Notification Telemetry Audit
CREATE TABLE sms_notification (
    id SERIAL PRIMARY KEY,
    recipient_phone VARCHAR(20) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL DEFAULT '+91 7890100849',
    message TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    patient_id INT REFERENCES patient(id) ON DELETE SET NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Automated SMS Notification Lifecycle & Templates

The notification layer (`SmsService.java`) dispatches messages via an event-driven mechanism:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Clinical / Administrative Staff
    participant Core as Spring Boot Service Layer
    participant DB as PostgreSQL Database
    participant SMS as SmsService Engine
    participant Gate as Fast2SMS / Twilio Gateway
    actor Pat as Patient Device

    Staff->>Core: Trigger Event (e.g., Complete Appointment)
    Core->>DB: Update Entity Status (status = 'Completed')
    Core->>SMS: sendAppointmentCompletedSms(appointment)
    SMS->>DB: Persist Audit Log (status = 'DISPATCHED')
    SMS->>Gate: HTTP POST Payload (Sender: +91 7890100849)
    Gate-->>Pat: Direct Cellular Delivery (SMS)
    SMS-->>Core: Success Acknowledgement
```

#### Message Templates by Event:

| Event Type | Trigger Origin | Example SMS Body Sent to Patient |
| :--- | :--- | :--- |
| **APPOINTMENT_BOOKED** | Receptionist / Patient self-booking | `SEBASETHU Hospital: Dear Rahul, your appointment with Dr. Amit Sharma is CONFIRMED for 2026-11-22 at 10:30 AM. Helpline: +91 7890100849.` |
| **APPOINTMENT_COMPLETED**| Doctor marks consultation done | `SEBASETHU Hospital: Dear Rahul, your consultation with Dr. Amit Sharma has been completed. Check your portal for prescriptions. Queries: +91 7890100849.` |
| **BED_ASSIGNED** | Inpatient admission / Bed transfer | `SEBASETHU Care: Dear Rahul, you have been admitted to General Ward, Bed G-104. Nursing station is notified. Hospital Desk: +91 7890100849.` |
| **PRESCRIPTION_ISSUED** | Doctor generates prescription | `SEBASETHU Rx: Dear Rahul, Dr. Amit has prescribed: Paracetamol 650mg (Twice daily, 5 days). Please take medicines on time. Desk: +91 7890100849.` |
| **BILL_GENERATED** | Billing clerk generates invoice | `SEBASETHU Billing: Invoice #INV-8924 for Rs 1,450.00 is generated for Rahul. Status: PENDING. Pay at desk or online. Helpline: +91 7890100849.` |
| **BILL_PAID** | Payment recorded (Cash/Card/UPI) | `SEBASETHU Billing: Payment of Rs 1,450.00 for Invoice #INV-8924 received successfully. Receipt confirmed. Thank you!` |

---

### 3. Key REST API Endpoints & Contracts

For inclusion in technical slides demonstrating clean REST API design:

```http
### 1. Patient Directory
GET /patients
POST /patients
DELETE /patients/{id}

### 2. Doctor Directory
GET /doctors
POST /doctors
DELETE /doctors/{id}

### 3. Department Management
GET /departments
POST /departments
DELETE /departments/{id}

### 4. Inpatient & Bed Allocation
GET /beds
GET /wards
PATCH /beds/{bedId}/assign       -> { "patientId": 101 }
PATCH /beds/{bedId}/release
PATCH /beds/{bedId}/status       -> { "status": "MAINTENANCE" }

### 5. Appointments & Telemetry
GET /appointments
POST /appointments              -> { "patientId": 101, "doctorId": 5, "date": "2026-11-25", "time": "10:30" }
PUT /appointments/{id}/status?status=COMPLETED

### 6. Prescriptions
GET /prescriptions
POST /prescriptions             -> { "patientId": 101, "doctorId": 5, "notes": "...", "medicines": [...] }

### 7. Billing Engine
GET /bills
POST /bills                     -> { "patientId": 101, "amount": 1450.0, "description": "Consultation + CBC" }
PATCH /bills/{id}/status        -> { "status": "PAID" }

### 8. SMS Telemetry Logs
GET /notifications/sms
GET /notifications/sms/patient/{patientId}
```

---

### 4. DevOps, Infrastructure & Cloud Configuration

| Attribute | Backend Infrastructure | Frontend Infrastructure | Database Infrastructure |
| :--- | :--- | :--- | :--- |
| **Platform** | Render.com Web Service | Vercel Edge Hosting | Neon.tech Serverless Postgres |
| **Runtime** | Java 21 Temurin Alpine | Node.js 20 (Vite Bundler) | PostgreSQL 16 Engine |
| **Packaging** | Multi-Stage Dockerfile | Static Production Bundle (`dist/`) | Cloud-native Ephemeral Storage |
| **Networking** | Internal Port 8080 mapping | Global CDN with HTTPS Edge | TLS 1.3 with SNI (`sslmode=require`) |
| **Auto-Scale** | Scale-to-zero / On-demand spin-up | Globally distributed serverless edges | Auto-suspend compute on idle |

---

### 5. Key Engineering Innovations & Solutions Defended

When technical evaluators ask: *"What technical hurdles did your team solve?"*, present these three case studies:

1. **PostgreSQL JDBC Embedded Credentials Normalization:**
   - *Problem:* Neon and cloud providers issue connection strings formatted as `postgresql://user:password@host/db`. The standard PostgreSQL JDBC driver (`org.postgresql.Driver`) fails on this syntax, interpreting the colon after the username as an illegal port number.
   - *Solution:* Implemented custom `DatabaseConfig.java` bean that intercepts the datasource property, decomposes the URI, strips credentials into explicit username and password fields, and appends `?sslmode=require`.

2. **Wildcard & Regex CORS Authorization:**
   - *Problem:* Spring MVC's controller-level `@CrossOrigin` annotations conflict with global `WebMvcConfigurer` definitions, causing cross-origin preflight (`OPTIONS`) blocks on dynamic Vercel preview URLs.
   - *Solution:* Removed restrictive annotations across all controllers and established unified `CorsConfiguration` using `.allowedOriginPatterns("https://*.vercel.app", "http://localhost:*")` with full credential support.

3. **Resilient Dual-Mode SMS Dispatcher:**
   - *Problem:* External SMS gateways can face network timeouts or quota exhaustion, which could potentially block transactional database commits.
   - *Solution:* Implemented non-blocking dispatch wrapped in database logging. Even if a third-party gateway fails or runs in local mock mode, clinical records succeed, and dispatch telemetry is recorded for auditing.

---

### 6. Recommended Presentation Flow & Speaker Talking Points

```
[Slide 1 - Title]
"Good morning/afternoon. Today we present SEBASETHU, a cloud-native, end-to-end hospital management system that bridges clinical operations with automated patient communication."

[Slide 2 - The Problem]
"Hospitals face two recurring problems: operational fragmentation and communication gaps. When patients miss appointments or are unaware of their bed status or medicine instructions, operational friction escalates."

[Slide 3 - Architecture]
"To resolve this, we built a decoupled architecture: an edge-deployed React 18 client on Vercel communicating via REST with a containerized Java 21 Spring Boot core on Render, backed by serverless PostgreSQL on Neon."

[Slide 4 - Schema & Data]
"Our database models the entire clinical lifecycle across 10 normalized tables, maintaining foreign key integrity from departments and doctors down to wards, beds, prescriptions, and billing records."

[Slide 5 - SMS Telemetry Engine]
"The differentiator is our notification engine. Powered by hospital sender number +91 7890100849, patients receive timely, automated cellular SMS alerts upon booking, completion, ward admission, prescription issuance, and invoice payment."

[Slide 6 - Production & DevOps]
"We prioritized enterprise readiness: multi-stage Docker builds, PgBouncer pooling, JDBC sanitization, and responsive UI interfaces designed for desktop and mobile healthcare workers."

[Slide 7 - Conclusion & Demo]
"We welcome your questions and invite you to inspect the live running application."
```
