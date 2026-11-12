# SEBASETHU Frontend

SEBASETHU is a React frontend for the Hospital Management System. It uses a light healthcare design, large readable controls, and responsive layouts. Every module uses a service layer: demo mode uses role-scoped browser data, while real mode calls its documented API and displays a clear error when the Spring Boot endpoint is unavailable.

## 1. Requirements

Install these first:

- Node.js 20 or newer
- npm 10 or newer
- A browser such as Chrome or Edge
- Optional: Java 21 and Maven for the Spring Boot backend

Check your versions:

```powershell
node --version
npm --version
```

## 2. Install and run

Open PowerShell in this `frontend` folder:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173/
```

Keep the terminal running while using the app. Stop the server with `Ctrl+C`.

## 3. Role-based account access

Open `/login` or click **Staff login** on the home page. Choose the account type and sign in with credentials issued by the hospital authentication service.

Patients and doctors can submit registrations from the sign-in page. Administrator self-registration is intentionally unavailable. Doctor signups remain pending until an administrator approves them; pending doctors cannot sign in. The frontend expects a verified role, user ID, and access token, plus `approvalStatus: "APPROVED"` for doctors. It does not grant access when approval cannot be confirmed.

Protected routes save the requested page for after sign-in and show a dedicated not-authorized page for accounts with the wrong role. API `401` responses clear the active session and return to sign-in. Signed-in accounts receive an inactivity warning after 25 minutes and are signed out after 30 minutes without activity. Use **Account security** in the account menu to change a password; password changes sign the account out.

## 4. Mock mode and backend mode

The `.env` file controls the data source:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true
VITE_DEMO_MODE=true
```

**Demo mode is currently enabled in the checked-in `.env` for local testing.** It uses browser local storage and is not secure or suitable for production. It bypasses the backend and demonstrates role-specific navigation, patient/doctor registration, pending doctor approval, password reset/change, appointments, prescriptions and admin prescription edits. Demo requests do not send email or notify hospital staff.

Use `VITE_DEMO_MODE=false` for backend integration. Restart Vite after changing `.env`. `VITE_USE_MOCK=true` independently selects the small legacy patient/doctor mock fixtures.

Sample demo accounts (password `demo123`):

| Role | Email |
| --- | --- |
| Patient | `patient@sebasethu.health` |
| Doctor | `doctor@sebasethu.health` |
| Administrator | `admin@sebasethu.health` |
| Receptionist | `reception@sebasethu.health` |

Patient and doctor signup accounts are local to the browser. New demo doctors remain pending until an administrator approves them in **Doctor approval queue**. Demo patient data, appointments, linked family profiles, health history, lab reports, invoices, prescription edits, doctor availability, consultations, and urgent-help requests are also saved in browser local storage. Patient appointment cancellation/rescheduling, doctor consultation/availability changes, receptionist check-in, and health-profile updates are local demo actions. Password reset generates a short-lived link in the current browser; it does not send email. Email is never sent and urgent requests are not delivered to hospital staff in demo mode.

Shared polish includes role-scoped notifications, workspace search, breadcrumbs, responsive tables, printable clinical and billing documents, and explicit load/retry states. The doctor and patient staff directories support search, paging, and guarded demo CRUD. Real-mode operations never report success unless the service confirms it.

Use `VITE_USE_MOCK=false` when the backend is running and you want patients and doctors to use the real API. Restart Vite after changing `.env`.

The existing backend currently supports these real endpoints:

| Method | URL | Used by |
| --- | --- | --- |
| GET | `/patients` | Patient directory |
| POST | `/patients` | Add patient |
| GET | `/patients/{id}` | Patient details |
| DELETE | `/patients/{id}` | Delete patient |
| GET | `/doctors` | Doctor directory |
| POST | `/doctors` | Add doctor |
| GET | `/doctors/{id}` | Doctor details |
| DELETE | `/doctors/{id}` | Delete doctor |
| GET | `/wards` | Ward list |
| POST | `/wards` | Create ward |
| DELETE | `/wards/{id}` | Delete an empty ward |
| GET | `/beds` | Bed register and occupancy |
| POST | `/beds` | Add bed to a ward |
| PATCH | `/beds/{id}/assign` | Assign a patient to an available bed |
| PATCH | `/beds/{id}/release` | Release an occupied bed |
| PATCH | `/beds/{id}/status` | Mark a bed available or in maintenance |
| DELETE | `/beds/{id}` | Delete a non-occupied bed |

The public doctor directory uses only the documented `GET /doctors` and `GET /doctors/{id}` endpoints. Department names are derived from doctors returned by `GET /doctors`; no undocumented department or availability endpoint is called. The current backend does not provide doctor qualification, timings, consultation fees, a confirmed hospital address/phone/hours, health package catalog, or patient testimonials. In real mode those details are explicitly shown as unavailable rather than filled with demo values. Demo doctor profiles may show illustrative data and are labelled as examples.

The authentication, role-scoped appointment and prescription endpoints, department directory, family profile, patient records, patient billing/lab reports, prescription edit/audit, doctor approval, password reset/change, email-status, urgent-help, and new administrator APIs required by the role-based workflows are not currently implemented by the backend. Requests to those features show API errors rather than simulate a successful action. Administrator billing and labs remain preview modules. Beds & Wards always calls the backend, regardless of `VITE_USE_MOCK`; it also loads patients from the backend for bed assignment.

### Additional backend integration contracts

The role-based frontend is prepared to use the following endpoints; the Spring Boot backend must implement and authorize them before these workflows can be used end to end:

| Method | URL | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Request `{ email, password, role }`; return `{ token, user: { id, email, name, role, approvalStatus? } }`. `approvalStatus` is required and must be `APPROVED` for a doctor. Reject pending/rejected doctors server-side. |
| POST | `/auth/register` | Request patient or doctor registration fields; return `{ status, message }`. Doctor registration must return `status: "PENDING"` and remain unable to sign in until approved. Administrator registration remains restricted. |
| POST | `/auth/forgot-password` | Request `{ email }`; return a generic `{ message }` without revealing whether the account exists. Send a time-limited, single-use reset link out of band. |
| POST | `/auth/reset-password` | Request `{ token, newPassword }`; return `{ message }` after consuming a valid, unexpired, single-use token. |
| POST | `/auth/change-password` | Authenticated request `{ currentPassword, newPassword }`; return `{ message }` only after verifying the current password. |
| GET | `/admin/doctors/pending` | Admin-only list of pending doctor registrations: `[{ id, name, email, specialization, experience, approvalStatus, registeredAt }]`. |
| PATCH | `/admin/doctors/{id}/verification` | Admin-only request `{ approvalStatus: "APPROVED" | "REJECTED" }`; return the reviewed doctor including its new `approvalStatus`. |
| GET | `/admin/dashboard` | Admin-only overview JSON: `{ stats: [{ label, value, change, tone }], weeklyAppointments: [{ day, scheduled, completed }], departmentPatients: [{ department, patients }], appointments: [{ time, patient, doctor, type, status }] }`. Return metrics from authorized hospital records. |
| GET | `/admin/users` | Admin-only account list `[{ id, name, email, role, active }]`; never return credentials, password hashes, or tokens. |
| PATCH | `/admin/users/{id}/status` | Admin-only request `{ active: true | false }`; prevent disabling the last active administrator and return the user with the confirmed `active` state. Record the change in the audit log. |
| PATCH | `/admin/users/{id}/role` | Admin-only request `{ role: "ADMIN" | "DOCTOR" | "PATIENT" | "RECEPTIONIST" }`; validate linked patient/doctor profiles and verification state, prevent self-demotion or removing the last active administrator, and return the updated safe user record. Record the change in the audit log. |
| GET | `/admin/audit-log?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD` | Admin-only filtered audit entries `[{ id, actorName, actorRole, action, entityType, entityId, summary, occurredAt }]`; include doctor approvals, user status, hospital settings, service catalog, and prescription changes. |
| GET | `/admin/settings/hospital` | Admin-only hospital settings `{ name, hours, contactPhone, emergencyPhone, address }`. |
| PUT | `/admin/settings/hospital` | Admin-only request `{ name, hours, contactPhone, emergencyPhone, address }`; validate required fields, persist and return the saved settings, and record an audit entry. |
| GET | `/admin/services` | Admin-only service catalog `[{ id, name, departmentId, departmentName, price, currency }]`. |
| POST | `/admin/services` | Admin-only request `{ name, departmentId, price }`; validate the department and positive price, then return the created catalog item and record an audit entry. |
| PATCH | `/admin/services/{id}` | Admin-only request `{ name, departmentId, price }`; validate and return the updated catalog item and record an audit entry. |
| GET | `/admin/reports?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD` | Admin-only date-filtered JSON `{ fromDate, toDate, registeredPatients, completedAppointments, recordedRevenue, registrations: [{ month, patients }], appointmentStatuses: [{ status, total }], revenueByDepartment: [{ department, revenue }] }`; totals and CSV data must use the same filtered records. |
| POST | `/departments` | Admin-only request `{ name, headDoctor?, description }`; return the created department. |
| GET | `/departments` | List departments for department-first doctor selection |
| GET | `/departments/{department}/doctors` | List doctors in the selected department |
| GET | `/patients/me/linked` | Return only the signed-in patient's own and linked family profiles |
| POST | `/patients/me/linked` | Add a family profile after server-side relationship/permission checks |
| GET/POST | `/appointments/me` | Read or book appointments for the signed-in patient |
| GET | `/appointments/me` | Return appointments scoped to the signed-in doctor when the user role is DOCTOR |
| PUT | `/appointments/me/{id}/status?status=Cancelled` | Patient-only cancellation; return the updated appointment and reject completed/past visits |
| PATCH | `/appointments/me/{id}/reschedule` | Request `{ "date": "YYYY-MM-DD", "time": "HH:mm" }`; return the updated appointment after ownership, future-date, and slot checks |
| GET | `/prescriptions/me` | Return only prescriptions visible to the signed-in patient or doctor |
| PUT | `/prescriptions/{id}` | Allow an authorized admin to edit an existing prescription without replacing its doctor author; return audit history |
| GET/POST | `/urgent-help/me` and `/urgent-help` | Submit urgent-help requests and retrieve status/acknowledgement |
| GET | `/patients/me/linked/{id}` | Return one own/linked profile, including blood group, allergies, emergency contact, and insurance fields |
| PATCH | `/patients/me/linked/{id}` | Update allowed health-profile fields; authorize only the account owner or an explicitly linked representative; return the updated profile |
| GET | `/patients/me/linked/{id}/history` | Return the selected own/linked patient's medical history as `[{ id, date, type, title, detail }]` |
| GET | `/patients/me/linked/{id}/lab-reports` | Return only the selected own/linked patient's reports as `[{ id, name, date, status, result, downloadUrl? }]` |
| GET | `/patients/me/linked/{id}/invoices` | Return only the selected own/linked patient's invoices as `[{ id, invoiceNumber, date, description, amount, status }]` |
| GET | `/doctors/me/availability` | Return `{ workingDays, startTime, endTime, slotMinutes, leaveDates }` for the signed-in, approved doctor |
| PATCH | `/doctors/me/availability` | Request `{ workingDays, startTime, endTime, slotMinutes, leaveDates }`; validate time ranges and return the saved availability |
| GET | `/doctors/me/patients?search={term}` | Return only patients with appointments assigned to the signed-in doctor; optionally search by name or phone |
| GET | `/doctors/me/patients/{id}/chart` | Return the authorized patient's demographics, allergies, visit history, this doctor's prescriptions, medical history and lab results |
| POST | `/doctors/me/appointments/{id}/consultation` | Request `{ diagnosis, notes, labTests, createPrescription, prescriptionNotes, medicines }`; each medicine includes `{ name, dosage, frequency, duration, patientInstructions }`, where `patientInstructions` is a plain-language, doctor-authored schedule such as when to take each dose. Atomically save the consultation and any orders, then mark the assigned appointment completed; return `{ consultation, appointment, prescription?, labOrders? }` |
| POST | `/doctors/me/appointments/{id}/follow-ups` | Request `{ date, time }`; authorize the completed visit, validate doctor availability and conflicts, then return the new patient appointment |
| GET | `/doctors/me/profile` | Return the signed-in doctor's verified professional profile and contact details |
| PATCH | `/doctors/me/profile` | Update only allowed contact fields such as `{ phone, professionalBiography }`; verified credentials remain admin-managed |
| POST | `/reception/appointments/{id}/check-in` | Receptionist-only check-in for an appointment scheduled today; return the appointment with `status: "Checked In"` and `checkedInAt` |
| PATCH | `/reception/appointments/{id}/reschedule` | Receptionist-only request `{ date, time }`; validate a future/current date, doctor availability, appointment ownership and slot conflicts; return the updated appointment |
| GET | `/reception/invoices` | Return the authorized reception billing queue as `[{ id, patientId, appointmentId?, invoiceNumber, date, description, amount, status, paymentMethod?, paidAt? }]` |
| POST | `/reception/invoices` | Request `{ patientId, appointmentId?, description, amount }`; validate patient/appointment relationship and positive amount; return the new pending invoice |
| PATCH | `/reception/invoices/{id}/payment` | Request `{ paymentMethod }`; record a payment received by staff, not a card/bank charge; return the invoice with `status: "Paid"` and `paidAt` |

Email delivery and audit history must be confirmed by backend response data. The urgent-help form does not contact emergency services; immediate emergencies require contacting local emergency services.

## 5. Available pages

Public pages:

- `/` - SEBASETHU landing page
- Landing page includes About and Contact in-page sections plus an ambulance information panel; actual hospital dispatch details remain unavailable until confirmed
- `/find-a-doctor` - public doctor search by name, department and listed availability days
- `/doctors/{id}` - public doctor profile using fields returned by the existing doctor API
- `/care/departments` and `/care/departments/{department}` - public department directory and provider list derived from the doctor API
- `/login` - patient, doctor, or administrator sign in
- `/register/patient` - patient/family representative registration
- `/register/doctor` - doctor registration
- `/forgot-password` - password reset request (demo mode displays a no-email notice)
- `/reset-password?token=...` - complete a single-use password reset

Protected pages:

- `/dashboard` - administrator overview, charts, appointments and quick actions
- `/doctor` - clinician dashboard with today's patients, next patient, and pending visits
- `/doctor/schedule` - doctor day/week appointment schedule
- `/doctor/availability` - manage working days, hours, slot length, and leave dates
- `/doctor/patients` and `/doctor/patients/{id}` - assigned patient list and authorized patient chart
- `/doctor/consultation/{appointmentId}` - visit notes, diagnosis, optional prescription and lab orders, and appointment completion
- `/doctor/profile` - doctor professional profile and editable contact information
- `/patient` - patient overview
- `/patient/dashboard` - patient dashboard route from the reference
- `/patient/book` - patient department-first appointment booking
- `/patient/records` - patient and linked family health history
- `/patient/labs` - patient and linked family lab reports
- `/patient/billing` - patient and linked family invoices and payment status
- `/patient/profile` - update the signed-in patient's health information
- `/reception/appointments` - walk-in patient registration, today's appointment queue, check-in, and appointment booking/rescheduling/cancellation on behalf of patients
- `/reception/wards` - read-only bed and ward occupancy view
- `/reception/billing` - create invoices, record received payments, and print receipts
- `/admin/staff` - administrator staff directory
- `/admin/doctor-approvals` - administrator queue for pending doctor accounts
- `/admin/users` - administrator account search and active/inactive status management
- `/admin/audit-log` - administrator audit history with date and text filters
- `/dashboard` - administrator dashboard metrics and current hospital activity
- `/reports` - date-filtered administrator reports with CSV export
- `/settings` - hospital contact, hours, and emergency number settings
- `/departments` - administrator departments and service price catalog
- `/my-appointments` - upcoming/past patient appointments, department-first booking, cancellation confirmation, rescheduling, and family profiles
- `/patients` - patient search, pagination, create, view and delete
- `/doctors` - doctor directory, create, view and delete
- `/appointments` - booking, list view, week view and status changes
- `/departments` - department management and service catalog
- `/prescriptions` - doctors create; patients view their own; administrators preview and edit existing records with backend audit history
- `/urgent-help` - patient urgent request and status view
- `/reports` - charts, date filters and CSV export
- `/billing` - invoices and payment status preview
- `/beds` - ward and bed inventory, occupancy assignment/release, and maintenance status
- `/labs` - lab test tracking preview
- `/account/security` - password change for every signed-in role
- `/settings` - administrator profile and settings
- `/unauthorized` - signed-in account does not have permission for the requested page

## 6. Backend run order

If you want to use the Spring Boot API:

1. Open a second PowerShell terminal.
2. Move to the project root, the folder containing `pom.xml`:

```powershell
cd ..
mvn spring-boot:run
```

3. Keep the frontend running in the first terminal.
4. Set `VITE_DEMO_MODE=false` to use backend authentication and API routes, and restart Vite.
5. Restart the frontend after changing `.env`.

The backend must allow the frontend origin `http://localhost:5173` through CORS.

## 7. Production build

Create the production bundle:

```powershell
npm run build
```

Test the built bundle locally:

```powershell
npm run preview
```

The output is created in `dist/`. Do not edit files inside `dist/`; they are generated.

## 8. Project structure

```text
src/
  api/          Axios instance and one service per module
  components/   Shared UI and application layout
  context/      Authentication context
  mock/         Demo records used in mock mode
  pages/        Public, auth, dashboard and module pages
  utils/        Small formatting helpers
  routes.jsx    Public and protected routes
  main.jsx      React entry point
```

To add a module:

1. Add its service in `src/api/`.
2. Add mock records in `src/mock/data.js` when needed.
3. Create a page in `src/pages/`.
4. Add a protected route in `src/routes.jsx`.
5. Add a labelled link in `src/components/layout.jsx`.
6. Run `npm run build`.

## 9. Common problems

### `npm` cannot find `package.json`

You are one folder too high. Run:

```powershell
cd "Hospital-Management\frontend"
npm run dev
```

### Port 5173 is already in use

Stop the old Vite process, or run:

```powershell
npm run dev -- --port 5174
```

### Login keeps showing an old screen

Refresh the browser and sign in again. Access tokens are kept in memory and are cleared on sign-out or an API `401` response.

### API requests fail

For a presentation, set `VITE_DEMO_MODE=true` (demo mode takes precedence over the legacy `VITE_USE_MOCK` fixtures). For real API mode, set both flags to `false`, confirm Spring Boot is running on port `8080`, the endpoint exists, and CORS includes port `5173`.

## 10. Useful commands

```powershell
npm install       # install dependencies
npm run dev       # start development server
npm run build     # validate and create production bundle
npm run preview   # preview production bundle
```

## 11. Complete frontend API contract

This is the authoritative inventory of every HTTP endpoint called by `src/api/`. Demo mode bypasses these requests. In real mode, APIs not implemented by Spring Boot must return a clear HTTP error; the frontend does not substitute demo data or display a success-shaped response. Except for public reads and unauthenticated auth endpoints, requests require a bearer access token. The backend must enforce the role and record-level ownership described below.

| Method | URL | Request JSON | Response JSON | Access and notes |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | `{ "email": "user@example.org", "password": "...", "role": "PATIENT" }` | `{ "token": "...", "user": { "id": 1, "email": "...", "name": "...", "role": "PATIENT", "patientId": 1, "approvalStatus": "APPROVED" } }` | Public. Doctors must be approved; reject inactive, pending, or rejected accounts. |
| POST | `/auth/register` | Patient: `{ "role": "PATIENT", "name": "...", "email": "...", "password": "...", "phone": "...", "age": 30, "gender": "...", "patientRelationship": "SELF" | "FAMILY", "relationship": "...", "patientName": "..." }`; doctor: `{ "role": "DOCTOR", "name": "...", "email": "...", "password": "...", "phone": "...", "specialization": "...", "experience": 3 }` | `{ "status": "REGISTERED" | "PENDING", "message": "..." }` | Public. Never permit administrator self-registration; new doctors remain unapproved. |
| POST | `/auth/forgot-password` | `{ "email": "user@example.org" }` | `{ "message": "..." }` | Public; response must not disclose whether the account exists. Send a single-use, time-limited link out of band. |
| POST | `/auth/reset-password` | `{ "token": "...", "newPassword": "..." }` | `{ "message": "..." }` | Public; consume a valid, unexpired, single-use token. |
| POST | `/auth/change-password` | `{ "currentPassword": "...", "newPassword": "..." }` | `{ "message": "..." }` | Authenticated; verify the current password. |
| GET | `/patients` | None | `[{ "id": 1, "name": "...", "age": 30, "gender": "...", "phone": "..." }]` | Authorized staff; also used by reception and bed assignment. |
| POST | `/patients` | `{ "name": "...", "age": 30, "gender": "...", "phone": "..." }` | `{ "id": 1, "name": "...", "age": 30, "gender": "...", "phone": "...", "registeredAt": "YYYY-MM-DD" }` | Authorized staff registration. |
| GET | `/patients/{id}` | None | `{ "id": 1, "name": "...", "age": 30, "gender": "...", "phone": "..." }` | Staff with permission for this patient. |
| DELETE | `/patients/{id}` | None | `204 No Content` | Authorized staff; enforce retention and clinical-record policies. |
| GET | `/patients/me/linked` | None | `[{ "id": 1, "name": "...", "age": 30, "gender": "...", "relationshipToAccount": "SELF", "isSelf": true }]` | Patient only; own and explicitly linked family profiles. |
| POST | `/patients/me/linked` | `{ "name": "...", "age": 30, "gender": "...", "phone": "...", "relationship": "CHILD" }` | `{ "id": 2, "name": "...", "age": 30, "gender": "...", "relationshipToAccount": "CHILD", "isSelf": false }` | Patient only; verify the account may link this family member. |
| GET | `/patients/me/linked/{patientId}` | None | `{ "id": 1, "name": "...", "bloodGroup": "O+", "allergies": [], "emergencyContact": "...", "insuranceProvider": "...", "insurancePolicy": "..." }` | Patient only; authorize own or linked profile. |
| PATCH | `/patients/me/linked/{patientId}` | `{ "bloodGroup": "O+", "allergies": ["..."], "emergencyContact": "...", "insuranceProvider": "...", "insurancePolicy": "..." }` | Updated patient profile object | Patient only; update allowed fields and confirm ownership/linkage. |
| GET | `/patients/me/linked/{patientId}/history` | None | `[{ "id": 1, "date": "YYYY-MM-DD", "type": "Visit", "title": "...", "detail": "..." }]` | Patient only; own or linked profile. |
| GET | `/patients/me/linked/{patientId}/lab-reports` | None | `[{ "id": 1, "name": "...", "date": "YYYY-MM-DD", "status": "Ready", "result": "...", "downloadUrl": "..." }]` | Patient only; own or linked profile. |
| GET | `/patients/me/linked/{patientId}/invoices` | None | `[{ "id": 1, "invoiceNumber": "...", "date": "YYYY-MM-DD", "description": "...", "amount": 500, "status": "Paid" }]` | Patient only; own or linked profile. |
| GET | `/doctors` | None | `[{ "id": 1, "name": "Dr. ...", "specialization": "...", "experience": 3, "qualification": "...", "timings": "...", "fee": 500 }]` | Public directory; return only approved providers. |
| POST | `/doctors` | `{ "name": "Dr. ...", "specialization": "...", "experience": 3 }` | `{ "id": 1, "name": "Dr. ...", "specialization": "...", "experience": 3 }` | Admin directory action; validate and persist the provider record. Do not approve a registration implicitly. |
| GET | `/doctors/{id}` | None | `{ "id": 1, "name": "Dr. ...", "specialization": "...", "experience": 3, "qualification": "...", "timings": "...", "fee": 500 }` | Public; fields not supplied by the backend are shown as unavailable. |
| DELETE | `/doctors/{id}` | None | `204 No Content` | Admin; reject deletion of active accounts or providers with appointment history. |
| GET | `/departments` | None | `[{ "id": 1, "name": "...", "headDoctor": "...", "description": "..." }]` | Public read for department-first doctor selection and directory. |
| GET | `/departments/{department}/doctors` | None | `[{ "id": 1, "name": "Dr. ...", "specialization": "...", "experience": 3 }]` | Public; return approved providers in the requested department. |
| POST | `/departments` | `{ "name": "...", "headDoctor": "...", "description": "..." }` | `{ "id": 1, "name": "...", "headDoctor": "...", "description": "..." }` | Admin; create a department. |
| GET | `/appointments` | None | `[{ "id": 1, "patient": { "id": 1, "name": "..." }, "doctor": { "id": 1, "name": "Dr. ...", "specialization": "..." }, "date": "YYYY-MM-DD", "time": "HH:mm", "status": "Scheduled" }]` | Authorized staff appointment queue; filter to the caller's permitted scope. |
| GET | `/appointments/me` | None | Array of appointment objects (same shape as `/appointments`) | Patient: own/linked appointments only. Doctor: only appointments assigned to that doctor. |
| POST | `/appointments` | `{ "patientId": 1, "doctorId": 1, "date": "YYYY-MM-DD", "time": "HH:mm" }` | Appointment object with assigned patient, doctor, date, time, and status | Reception/staff booking; verify patient, provider, availability, and conflicts. |
| POST | `/appointments/me` | `{ "patientId": 1, "doctorId": 1, "date": "YYYY-MM-DD", "time": "HH:mm" }` | Appointment object with status and optional `emailNotificationStatus` | Patient booking; authorize own/linked patient and verify availability/conflicts. |
| PUT | `/appointments/me/{id}/status?status=Cancelled` | None (query `status=Cancelled`) | Updated appointment object | Patient only; only permitted future, non-completed visits; check ownership. |
| PATCH | `/appointments/me/{id}/reschedule` | `{ "date": "YYYY-MM-DD", "time": "HH:mm" }` | Updated appointment object | Patient only; check ownership, future date, availability, and conflicts. |
| PUT | `/appointments/{id}/status?status={status}` | None (query `status=Completed` or `Cancelled`) | Updated appointment object | Authorized staff/doctor; restrict statuses and assigned appointment access. |
| POST | `/reception/appointments/{id}/check-in` | None | `{ "id": 1, "status": "Checked In", "checkedInAt": "ISO-8601" }` | Receptionist; appointment must be scheduled for today. |
| PATCH | `/reception/appointments/{id}/reschedule` | `{ "date": "YYYY-MM-DD", "time": "HH:mm" }` | Updated appointment object | Receptionist; verify patient/doctor association, availability, and conflicts. |
| GET | `/prescriptions` | None | `[{ "id": 1, "patient": { "id": 1, "name": "..." }, "doctor": { "id": 1, "name": "Dr. ..." }, "createdAt": "YYYY-MM-DD", "notes": "...", "medicines": [{ "name": "...", "dosage": "...", "frequency": "...", "duration": "...", "patientInstructions": "Take one tablet after breakfast and one before bed." }] }]` | Authorized doctor/admin; enforce assigned clinical access. |
| GET | `/prescriptions/me` | None | Array of prescription objects | Patient: own/linked prescriptions only. Doctor: prescriptions authored by or assigned to that doctor. |
| POST | `/prescriptions` | `{ "patientId": 1, "doctorId": 1, "notes": "...", "medicines": [{ "name": "...", "dosage": "...", "frequency": "...", "duration": "...", "patientInstructions": "Take one tablet after breakfast and one before bed." }] }` | Created prescription object containing the doctor-authored `patientInstructions` for every medicine | Doctor only; authorize patient assignment and persist clinical author. `patientInstructions` is required and should explain timing and dose schedule in plain language. |
| PUT | `/prescriptions/{id}` | `{ "notes": "...", "medicines": [{ "name": "...", "dosage": "...", "frequency": "...", "duration": "...", "patientInstructions": "..." }] }` | Updated prescription object including `auditHistory` | Admin edit; preserve original author and append immutable audit history. |
| GET | `/notifications/me` | None | `[{ "id": "1", "title": "...", "message": "...", "href": "/patient/records", "createdAt": "ISO-8601", "read": false }]` | Authenticated; return only this user's notifications. `href` must be a same-app path beginning with one `/`. |
| POST | `/urgent-help` | `{ "reason": "...", "details": "..." }` | `{ "id": 1, "status": "...", "acknowledgement": "...", "createdAt": "ISO-8601" }` | Patient only. This is not an emergency-service call; disclose delivery status explicitly. |
| GET | `/urgent-help/me` | None | `[{ "id": 1, "reason": "...", "details": "...", "status": "...", "acknowledgement": "...", "createdAt": "ISO-8601" }]` | Patient only; own requests. |
| GET | `/doctors/me/availability` | None | `{ "workingDays": ["Monday"], "startTime": "09:00", "endTime": "17:00", "slotMinutes": 30, "leaveDates": [] }` | Approved doctor only; own schedule. |
| PATCH | `/doctors/me/availability` | `{ "workingDays": ["Monday"], "startTime": "09:00", "endTime": "17:00", "slotMinutes": 30, "leaveDates": [] }` | Saved availability object | Approved doctor only; validate time ranges and appointment conflicts. |
| GET | `/doctors/me/patients?search={term}` | None (optional `search` query) | `[{ "id": 1, "name": "...", "age": 30, "gender": "...", "phone": "...", "lastVisit": "YYYY-MM-DD" }]` | Approved doctor only; only patients with appointments assigned to this doctor. |
| GET | `/doctors/me/patients/{patientId}/chart` | None | `{ "patient": { "id": 1, "name": "...", "allergies": [] }, "history": [], "prescriptions": [], "labReports": [] }` | Approved doctor only; verify this patient's assignment to the caller. |
| POST | `/doctors/me/appointments/{appointmentId}/consultation` | `{ "diagnosis": "...", "notes": "...", "labTests": [], "createPrescription": true, "prescriptionNotes": "...", "medicines": [{ "name": "...", "dosage": "...", "frequency": "...", "duration": "...", "patientInstructions": "..." }] }` | `{ "consultation": {}, "appointment": {}, "prescription": {}, "labOrders": [] }` | Approved assigned doctor; atomically save consultation/orders and complete the appointment. Each medicine requires clear patient-facing timing and dose instructions. |
| POST | `/doctors/me/appointments/{appointmentId}/follow-ups` | `{ "date": "YYYY-MM-DD", "time": "HH:mm" }` | New appointment object | Approved assigned doctor; validate original visit, availability, and conflicts. |
| GET | `/doctors/me/profile` | None | `{ "id": 1, "name": "Dr. ...", "specialization": "...", "phone": "...", "professionalBiography": "..." }` | Approved doctor; own verified profile. |
| PATCH | `/doctors/me/profile` | `{ "phone": "...", "professionalBiography": "..." }` | Updated doctor profile object | Approved doctor; credentials remain admin-managed. |
| GET | `/reception/invoices` | None | `[{ "id": 1, "patientId": 1, "appointmentId": 1, "invoiceNumber": "...", "date": "YYYY-MM-DD", "description": "...", "amount": 500, "status": "Pending", "paymentMethod": null, "paidAt": null }]` | Receptionist billing queue. |
| POST | `/reception/invoices` | `{ "patientId": 1, "appointmentId": 1, "description": "...", "amount": 500 }` | Created invoice object with `status: "Pending"` | Receptionist; validate patient/appointment relationship and positive amount. |
| PATCH | `/reception/invoices/{id}/payment` | `{ "paymentMethod": "CASH" }` | Updated invoice with `status: "Paid"`, `paymentMethod`, and `paidAt` | Receptionist records a payment received; this is not a card/bank charge. |
| GET | `/admin/doctors/pending` | None | `[{ "id": 1, "name": "...", "email": "...", "specialization": "...", "experience": 3, "approvalStatus": "PENDING", "registeredAt": "ISO-8601" }]` | Admin only. |
| PATCH | `/admin/doctors/{id}/verification` | `{ "approvalStatus": "APPROVED" }` | Reviewed doctor object with updated `approvalStatus` | Admin only; review each pending account once and audit the decision. |
| GET | `/admin/dashboard` | None | `{ "stats": [{ "label": "...", "value": "...", "change": "...", "tone": "teal" }], "weeklyAppointments": [{ "day": "Mon", "scheduled": 1, "completed": 0 }], "departmentPatients": [{ "department": "...", "patients": 1 }], "appointments": [{ "time": "HH:mm", "patient": "...", "doctor": "...", "type": "...", "status": "Scheduled" }] }` | Admin only; hospital-wide authorized metrics. |
| GET | `/admin/users` | None | `[{ "id": 1, "name": "...", "email": "...", "role": "PATIENT", "active": true }]` | Admin only; never return passwords, hashes, or tokens. |
| PATCH | `/admin/users/{id}/status` | `{ "active": false }` | Updated safe user object with `active` | Admin only; prevent self-deactivation and disabling the last active admin; audit change. |
| PATCH | `/admin/users/{id}/role` | `{ "role": "RECEPTIONIST" }` | Updated safe user object with `role` | Admin only; validate linked profiles and doctor approval; prevent self-demotion/last-admin loss; audit change. |
| GET | `/admin/audit-log?fromDate={date}&toDate={date}` | None (optional date query parameters) | `[{ "id": "...", "actorName": "...", "actorRole": "ADMIN", "action": "...", "entityType": "...", "entityId": "...", "summary": "...", "occurredAt": "ISO-8601" }]` | Admin only; filter by requested range and include relevant security/clinical edits. |
| GET | `/admin/settings/hospital` | None | `{ "name": "...", "hours": "...", "contactPhone": "...", "emergencyPhone": "...", "address": "..." }` | Admin only. |
| PUT | `/admin/settings/hospital` | `{ "name": "...", "hours": "...", "contactPhone": "...", "emergencyPhone": "...", "address": "..." }` | Saved hospital settings object | Admin only; validate, persist, and audit changes. |
| GET | `/admin/services` | None | `[{ "id": 1, "name": "...", "departmentId": 1, "departmentName": "...", "price": 500, "currency": "INR" }]` | Admin only. |
| POST | `/admin/services` | `{ "name": "...", "departmentId": 1, "price": 500 }` | Created service object | Admin only; validate department and positive price; audit change. |
| PATCH | `/admin/services/{id}` | `{ "name": "...", "departmentId": 1, "price": 600 }` | Updated service object | Admin only; validate and audit change. |
| GET | `/admin/reports?fromDate={date}&toDate={date}` | None (required date query parameters) | `{ "fromDate": "YYYY-MM-DD", "toDate": "YYYY-MM-DD", "registeredPatients": 1, "completedAppointments": 1, "recordedRevenue": 500, "registrations": [{ "month": "Jan 2026", "patients": 1 }], "appointmentStatuses": [{ "status": "Completed", "total": 1 }], "revenueByDepartment": [{ "department": "...", "revenue": 500 }] }` | Admin only; all totals/CSV data must share the same date filter. |
| GET | `/wards` | None | `[{ "id": 1, "name": "...", "department": "...", "floor": 1 }]` | Authorized ward/bed staff. |
| POST | `/wards` | `{ "name": "...", "department": "...", "floor": 1 }` | Created ward object | Authorized ward/bed staff. |
| DELETE | `/wards/{id}` | None | `204 No Content` | Authorized ward/bed staff; reject non-empty wards. |
| GET | `/beds` | None | `[{ "id": 1, "bedNumber": "...", "wardId": 1, "wardName": "...", "status": "AVAILABLE", "patientId": null, "patientName": null }]` | Authorized ward/bed staff. |
| POST | `/beds` | `{ "bedNumber": "...", "wardId": 1 }` | Created bed object | Authorized ward/bed staff; validate ward and unique bed number. |
| PATCH | `/beds/{id}/assign` | `{ "patientId": 1 }` | Updated bed object with `status: "OCCUPIED"` and patient details | Authorized ward/bed staff; only assign available beds. |
| PATCH | `/beds/{id}/release` | None | Updated bed object with `status: "AVAILABLE"` and no patient | Authorized ward/bed staff; only release occupied beds. |
| PATCH | `/beds/{id}/status` | `{ "status": "MAINTENANCE" }` | Updated bed object | Authorized ward/bed staff; do not mark an occupied bed available. |
| DELETE | `/beds/{id}` | None | `204 No Content` | Authorized ward/bed staff; reject occupied beds. |

Any optional response field shown above may be omitted only if the corresponding UI handles it as unavailable. All record-scoped endpoints must authorize on the server; a hidden button or client-side route guard is not an access-control boundary.