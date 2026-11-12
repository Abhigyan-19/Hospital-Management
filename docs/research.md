# SEBASETHU research and phase plan

Research checked 10 November 2026. Only features explicitly described on public pages are attributed to products; private portals were not assumed. MyChart describes appointment finding, records, bills, family access, and virtual care. Practo promotes doctor search, appointments, tests, and consultations. Apollo 24|7 describes consultations, pharmacy, tests, and a medical-record vault. Fortis promotes appointments, hospitals, specialties, health checkups, and medical reports. Bahmni describes patient management across registration, care, investigations, and billing; OpenMRS describes electronic records and multilingual adaptation; OpenEMR lists scheduling, prescribing, billing, labs, reporting, and multilingual support. AIIMS's public page was not readable enough to verify portal features; Zocdoc returned HTTP 403, so neither is used to infer features.

Sources: [MyChart](https://www.mychart.org/l/en-us/), [Practo](https://www.practo.com/), [Apollo 24|7](https://www.apollo247.com/), [Zocdoc](https://www.zocdoc.com/), [Fortis](https://www.fortishealthcare.com/), [AIIMS](https://www.aiims.edu/), [Bahmni](https://www.bahmni.org/), [OpenMRS](https://openmrs.org/), [OpenEMR](https://www.open-emr.org/).

## Feature comparison

“Present” describes the frontend before Phase 1. Partial means an incomplete flow, preview, or missing backend integration.

| Feature | Which role uses it | Present in our app? | Priority |
|---|---|---:|---|
| Home, about, services, departments | Public, all | Partial | Must |
| Doctor search by name/department/availability; profiles with qualification, experience, timings, fee | Public, patient | Partial | Must |
| Packages, contact/location/map, emergency number, hours, FAQ, testimonials | Public, all | Partial | Should |
| Language-friendly plain text | Public, all | Partial | Should |
| Role login; patient and doctor registration | All | Yes | Must |
| Doctor pending verification; reset/change password; session-timeout notice | Doctor, admin, all | Partial | Must |
| 401 redirect, role guards, not-authorised page | All | Partial | Must |
| Patient dashboard and department→doctor→date→slot booking for self/family | Patient | Partial | Must |
| Upcoming/past appointments, reschedule/cancel, health history/summary | Patient | Partial | Must |
| Prescriptions (view/download/print), lab reports, invoices/payment status | Patient | Partial | Must |
| Family members, notifications, complete profile, messages/help, urgent request | Patient | Partial | Must |
| Doctor dashboard/schedule, availability/leave, patient search and chart | Doctor | Partial | Must |
| Consultation notes/diagnosis, medicine prescription, lab order, completion/follow-up, profile | Doctor | Partial | Must |
| Walk-ins, check-in queue, delegated appointment changes, beds/wards, invoice/payment/receipt | Receptionist | Partial | Must |
| Analytics, doctor approval, user/role lifecycle, departments/services/prices, staff/schedules | Admin | Partial | Must |
| All appointments, billing, filtered reports/CSV, audit log, settings, audited prescription edits | Admin | Partial | Must |
| Notification dropdown, global search, breadcrumbs; skeletons, empty/error/retry states, toasts | All | Partial | Should |
| Confirm delete/cancel, table search/pagination, print prescription/invoice, mobile drawer/cards | All | Partial | Should |
| High contrast, readable large text, labelled controls, visible focus | All | Partial | Must |

## Audit: what is missing or weak

- **Public:** Homepage is mostly static and includes unverified counts, phone/address, hours, and emergency details. No working doctor search/profile, department pages, FAQ, package information, or verified testimonials.
- **Patient:** Dashboard is an appointment preview. History, labs, bills, rich profile, appointment changes, and notifications are missing; prescriptions are view-only. Family linking/booking rely on backend contracts not implemented.
- **Doctor:** Schedule is a flat list. No availability, patient directory/chart, consultation note/diagnosis, lab ordering, completion workflow, follow-up, or profile.
- **Receptionist:** Appointment/bed views exist, but walk-ins, check-in actions, delegated booking, billing, and receipts do not.
- **Admin and shared:** Directories, charts, and previews exist; approval, role lifecycle, schedules, audit, real settings, and connected billing/reports are missing. Several preview actions imply success without a backend. Auth lacks pending approval enforcement, reset completion, timeout notice, and a not-authorised page; shared retry, notification/search, and cancel confirmation are inconsistent.

## Implementation plan

1. **Phase 1 — Must (now): Public website.** Add honest hospital information, doctor search/filter/profile, departments, FAQ, contact/location, and accessible navigation. Real mode uses documented doctor endpoints only; unavailable information stays explicit.
2. **Phase 2 — Must: Auth/access.** Enforce pending doctor status, complete reset/change-password contracts, session expiry, role guards, and not-authorised page. Never grant access on API failure.
3. **Phase 3 — Must: Patient portal.** Complete appointments, profile/family, history, prescriptions, labs, bills, and help with patient-scoped data.
4. **Phase 4 — Must: Doctor portal.** Add schedule/availability, own patients/chart, consultation, prescriptions/labs, completion, and follow-up with doctor-scoped data.
5. **Phase 5 — Must: Reception.** Add walk-ins, check-in queue, delegated appointment changes, billing, and receipts.
6. **Phase 6 — Must: Admin.** Add verification, user/role management, services/prices, staff/schedules, appointments, billing, reports, audit, and settings.
7. **Phase 7 — Should, then Nice: Shared polish.** Complete notifications/search, breadcrumbs, error/retry/empty states, confirmations, pagination, printing, responsive and accessibility pass. Consider translation and richer reporting after hospital data/contracts are agreed.

Stop after each phase for a test walkthrough and README update. Undocumented backend features must show a clear not-connected state; mock behavior stays isolated to demo mode.
