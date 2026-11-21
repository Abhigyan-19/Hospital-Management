# Hospital Management System

A RESTful Hospital Management System backend developed using Java, Spring Boot, Spring Data JPA, Hibernate, and H2 Database.

The purpose of this project is to understand the fundamentals of Spring Boot backend development and the complete flow of a REST API, from receiving an HTTP request to interacting with the database.

The application currently manages:

* Patients
* Doctors
* Appointments
* Prescriptions
* Wards and beds, including patient occupancy and maintenance status

The backend follows a layered architecture consisting of Controllers, Services, Repositories, Entities, and Data Transfer Objects (DTOs).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Goals](#project-goals)
3. [Technologies Used](#technologies-used)
4. [Prerequisites](#prerequisites)
5. [Project Structure](#project-structure)
6. [Application Architecture](#application-architecture)
7. [Request Flow](#request-flow)
8. [Spring Boot Application](#spring-boot-application)
9. [Entity Layer](#entity-layer)
10. [Patient Entity](#patient-entity)
11. [Doctor Entity](#doctor-entity)
12. [Appointment Entity](#appointment-entity)
13. [Prescription Entity](#prescription-entity)
14. [Prescription Medicine Entity](#prescription-medicine-entity)
15. [Entity Relationships](#entity-relationships)
16. [Repository Layer](#repository-layer)
17. [Patient Repository](#patient-repository)
18. [Doctor Repository](#doctor-repository)
19. [Appointment Repository](#appointment-repository)
20. [Prescription Repository](#prescription-repository)
21. [DTO Layer](#dto-layer)
22. [Appointment Request DTO](#appointment-request-dto)
23. [Prescription Request DTO](#prescription-request-dto)
24. [Service Layer](#service-layer)
25. [Patient Service](#patient-service)
26. [Doctor Service](#doctor-service)
27. [Appointment Service](#appointment-service)
28. [Prescription Service](#prescription-service)
29. [Controller Layer](#controller-layer)
30. [Patient Controller](#patient-controller)
31. [Doctor Controller](#doctor-controller)
32. [Appointment Controller](#appointment-controller)
33. [Prescription Controller](#prescription-controller)
34. [Appointment Booking Logic](#appointment-booking-logic)
35. [Appointment Status](#appointment-status)
36. [Prescription Authorization](#prescription-authorization)
37. [Prescription Creation Flow](#prescription-creation-flow)
38. [Important Spring Annotations](#important-spring-annotations)
39. [Dependency Injection](#dependency-injection)
40. [JPA and Hibernate](#jpa-and-hibernate)
41. [REST API](#rest-api)
42. [Patient APIs](#patient-apis)
43. [Doctor APIs](#doctor-apis)
44. [Appointment APIs](#appointment-apis)
45. [Prescription APIs](#prescription-apis)
46. [Bed and Ward APIs](#bed-and-ward-apis)
47. [API Testing](#api-testing)
48. [Running the Backend](#running-the-backend)
49. [Frontend Integration](#frontend-integration)
50. [Maven Commands](#maven-commands)
51. [Git and GitHub](#git-and-github)
52. [Gitignore](#gitignore)
53. [Current Learning Outcomes](#current-learning-outcomes)
54. [Future Improvements](#future-improvements)

---

# Project Overview

The Hospital Management System is a Spring Boot REST API that provides backend functionality for managing patients, doctors, appointments, prescriptions, wards, and beds.

The application exposes REST endpoints that can be consumed by:

* Frontend applications
* Postman
* Mobile applications
* Other backend services

The current backend provides CRUD functionality for patients, doctors, wards, and beds; appointment creation and status management; and prescription creation and retrieval. Bed assignments and availability are stored in the database rather than generated from frontend mock data.

The prescription functionality also contains an authorization rule that verifies whether a doctor has a completed appointment with the patient before allowing a prescription to be created.

---

# Project Goals

The main objective of this project is to understand how a Spring Boot backend is structured and how its different components work together.

The project covers:

* Java backend development
* Spring Boot
* REST API development
* HTTP methods
* Layered architecture
* Controllers
* Services
* Repositories
* Dependency Injection
* Spring Data JPA
* Hibernate
* Entity relationships
* Data Transfer Objects
* H2 Database
* Maven
* Postman API testing
* Git and GitHub
* Frontend-backend communication
* CORS
* Business logic
* Prescription management
* Authorization based on appointment status

The project is intentionally structured so that each layer has a clearly defined responsibility.

---

# Technologies Used

| Technology        | Purpose                         |
| ----------------- | ------------------------------- |
| Java 21           | Programming language            |
| Spring Boot 3.2.5 | Backend framework               |
| Spring Web        | REST API development            |
| Spring Data JPA   | Database access                 |
| Hibernate         | ORM implementation              |
| H2 Database       | Relational database             |
| Maven             | Build and dependency management |
| IntelliJ IDEA     | Development environment         |
| Postman           | API testing                     |
| Git               | Version control                 |
| GitHub            | Source code hosting             |
| React / Vite      | Frontend integration            |
| Axios             | HTTP communication              |

---

# Prerequisites

Before running the backend, make sure the following are installed:

* Java JDK 21
* Maven
* Git
* IntelliJ IDEA or another Java IDE
* Postman for API testing

If the frontend is also being run locally, Node.js and npm are required.

---

# Project Structure

The current backend structure is:

```text
hospital_management
│
├── .gitignore
├── pom.xml
│
├── .idea/
├── .mvn/
│
└── src/
    │
    ├── main/
    │   │
    │   ├── java/
    │   │   │
    │   │   └── com/
    │   │       └── hospital/
    │   │           └── management/
    │   │
    │   │               ├── HospitalManagementApplication.java
    │   │               │
    │   │               ├── config/
    │   │               │   └── CorsConfig.java
    │   │               │
    │   │               ├── controller/
    │   │               │   ├── PatientController.java
    │   │               │   ├── DoctorController.java
    │   │               │   ├── AppointmentController.java
    │   │           │   │   ├── BedController.java
    │   │           │   │   ├── WardController.java
    │   │               │   └── PrescriptionController.java
    │   │               │
    │   │               ├── dto/
    │   │               │   ├── AppointmentRequest.java
    │   │           │   │   ├── BedRequest.java
    │   │           │   │   ├── BedAssignmentRequest.java
    │   │           │   │   ├── BedStatusRequest.java
    │   │           │   │   ├── BedResponse.java
    │   │           │   │   ├── WardRequest.java
    │   │               │   └── PrescriptionRequest.java
    │   │               │
    │   │               ├── entity/
    │   │               │   ├── Patient.java
    │   │               │   ├── Doctor.java
    │   │           │   │   ├── Bed.java
    │   │           │   │   ├── BedStatus.java
    │   │           │   │   ├── Ward.java
    │   │               │   ├── Appointment.java
    │   │               │   ├── Prescription.java
    │   │               │   └── PrescriptionMedicine.java
    │   │               │
    │   │               ├── repository/
    │   │               │   ├── PatientRepository.java
    │   │               │   ├── DoctorRepository.java
    │   │           │   │   ├── BedRepository.java
    │   │           │   │   ├── WardRepository.java
    │   │               │   ├── AppointmentRepository.java
    │   │               │   └── PrescriptionRepository.java
    │   │               │
    │   │               └── service/
    │   │                   ├── PatientService.java
    │   │                   ├── DoctorService.java
    │   │           │       ├── BedService.java
    │   │           │       ├── WardService.java
    │   │                   ├── AppointmentService.java
    │   │                   └── PrescriptionService.java
    │   │
    │   │           └── resources/
    │   │               └── application.properties
    │
    └── test/
```

---

# Application Architecture

The backend follows a layered architecture.

```text
Client
  |
  v
Controller
  |
  v
Service
  |
  v
Repository
  |
  v
JPA / Hibernate
  |
  v
Database
```

Each layer has a specific responsibility.

| Layer      | Responsibility                                           |
| ---------- | -------------------------------------------------------- |
| Controller | Handles HTTP requests and responses                      |
| Service    | Contains application and business logic                  |
| Repository | Provides database access                                 |
| Entity     | Represents persistent application data                   |
| DTO        | Transfers structured data between client and application |

This separation prevents different responsibilities from being mixed together.

---

# Request Flow

Consider an appointment creation request:

```http
POST /appointments
```

The client sends appointment information through the `AppointmentRequest` DTO.

The request flows through the application as follows:

```text
Client
  |
  v
AppointmentController
  |
  v
AppointmentRequest
  |
  v
AppointmentService
  |
  +----> PatientRepository
  |
  +----> DoctorRepository
  |
  +----> AppointmentRepository
  |
  v
JPA / Hibernate
  |
  v
H2 Database
```

For prescription creation, the flow is:

```text
Client
  |
  v
PrescriptionController
  |
  v
PrescriptionRequest
  |
  v
PrescriptionService
  |
  +----> PatientRepository
  |
  +----> DoctorRepository
  |
  +----> AppointmentRepository
  |
  +----> PrescriptionRepository
  |
  v
JPA / Hibernate
  |
  v
H2 Database
```

The response then travels back through the application:

```text
Database
  |
  v
Repository
  |
  v
Service
  |
  v
Controller
  |
  v
HTTP Response
```

---

# Spring Boot Application

The main application class is:

```text
HospitalManagementApplication.java
```

A Spring Boot application starts through:

```java
@SpringBootApplication
public class HospitalManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                HospitalManagementApplication.class,
                args
        );
    }
}
```

`@SpringBootApplication` combines several Spring features, including configuration and component scanning.

`SpringApplication.run()` starts the Spring application and creates the application context.

---

# Entity Layer

The Entity Layer represents persistent data.

The current entities are:

```text
Patient
Doctor
Appointment
Prescription
PrescriptionMedicine
Ward
Bed
```

Each entity is mapped to database tables using JPA annotations.

Ward records store a name, department, and floor. Bed records store a ward-scoped bed number, status, a required ward reference, and an optional patient reference.

---

# Patient Entity

The `Patient` entity represents a patient registered in the hospital system.

Its current fields are:

```text
id
name
age
gender
phone
```

The entity uses:

```java
@Entity
```

to indicate that it is a JPA entity.

The primary key is:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

The database generates the ID automatically when a new patient is created.

---

# Doctor Entity

The `Doctor` entity represents a doctor working in the hospital.

Its current fields are:

```text
id
name
specialization
experience
```

The doctor's specialization represents their medical department or area of practice.

The actual specialization values are stored in the database and are not hard-coded into the application.

---

# Appointment Entity

The `Appointment` entity represents an appointment between a patient and a doctor.

Its fields are:

```text
id
patient
doctor
date
time
status
```

The appointment maintains relationships with the `Patient` and `Doctor` entities:

```java
@ManyToOne
@JoinColumn(name = "patient_id", nullable = false)
private Patient patient;
```

and:

```java
@ManyToOne
@JoinColumn(name = "doctor_id", nullable = false)
private Doctor doctor;
```

This allows an appointment to reference existing patient and doctor records using their database IDs.

---

# Prescription Entity

The `Prescription` entity represents a prescription created by a doctor for a patient.

Its fields are:

```text
id
patient
doctor
notes
createdAt
medicines
```

The prescription maintains relationships with both the patient and doctor:

```java
@ManyToOne
@JoinColumn(name = "patient_id", nullable = false)
private Patient patient;
```

and:

```java
@ManyToOne
@JoinColumn(name = "doctor_id", nullable = false)
private Doctor doctor;
```

A prescription also contains a collection of medicines:

```java
@OneToMany(
        mappedBy = "prescription",
        cascade = CascadeType.ALL,
        orphanRemoval = true
)
private List<PrescriptionMedicine> medicines;
```

The prescription therefore acts as the parent entity for its associated medicines.

---

# Prescription Medicine Entity

The `PrescriptionMedicine` entity represents an individual medicine included in a prescription.

Its fields are:

```text
id
name
dosage
frequency
duration
prescription
```

Each medicine belongs to one prescription:

```java
@ManyToOne
@JoinColumn(name = "prescription_id", nullable = false)
private Prescription prescription;
```

The relationship is bidirectional at the JPA level.

The `prescription` field is excluded from JSON serialization using:

```java
@JsonIgnore
```

This prevents recursive JSON serialization when a prescription contains medicines and each medicine refers back to its prescription.

The database relationship is not affected by `@JsonIgnore`.

---

# Entity Relationships

The current entity relationships can be represented as:

```text
Patient 1 -------- * Appointment * -------- 1 Doctor

Patient 1 -------- * Prescription * -------- 1 Doctor

Prescription 1 -------- * PrescriptionMedicine

Ward 1 -------- * Bed 0..1 -------- 1 Patient
```

This means:

### Appointment

* One patient can have multiple appointments.
* One doctor can have multiple appointments.
* Each appointment belongs to one patient.
* Each appointment belongs to one doctor.

### Prescription

* One patient can have multiple prescriptions.
* One doctor can create multiple prescriptions.
* Each prescription belongs to one patient.
* Each prescription belongs to one doctor.

### Prescription Medicine

* One prescription can contain multiple medicines.
* Each medicine belongs to one prescription.

### Ward and Bed

* One ward contains multiple beds.
* Each bed belongs to one ward, and its number must be unique within that ward.
* A bed can have zero or one assigned patient. A patient can occupy at most one bed.
* A bed is `AVAILABLE`, `OCCUPIED`, or `MAINTENANCE`.
* Occupied beds must be released before they can be removed or moved to maintenance.

Conceptually, the database structure is:

```text
patients
--------
id
name
age
gender
phone


doctors
-------
id
name
specialization
experience


appointments
------------
id
patient_id
doctor_id
date
time
status


prescriptions
-------------
id
patient_id
doctor_id
notes
created_at


prescription_medicines
----------------------
id
name
dosage
frequency
duration
prescription_id
```

---

# Repository Layer

The Repository Layer is responsible for database access.

The current repositories are:

```text
PatientRepository
DoctorRepository
AppointmentRepository
PrescriptionRepository
```

The general flow is:

```text
Service
   |
   v
Repository
   |
   v
Spring Data JPA
   |
   v
Hibernate
   |
   v
Database
```

The Service Layer does not need to manually write SQL for standard CRUD operations.

---

# Patient Repository

The Patient Repository is defined as:

```java
public interface PatientRepository
        extends JpaRepository<Patient, Long> {
}
```

The generic parameters mean:

```text
Patient -> Entity type
Long    -> Primary key type
```

By extending `JpaRepository`, the repository automatically provides methods such as:

```java
save()
findAll()
findById()
deleteById()
```

---

# Doctor Repository

The Doctor Repository is:

```java
public interface DoctorRepository
        extends JpaRepository<Doctor, Long> {
}
```

It provides standard database operations for the `Doctor` entity.

---

# Appointment Repository

The Appointment Repository is:

```java
public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {
}
```

In addition to standard CRUD operations, it contains derived query methods used for appointment availability and prescription authorization.

The availability query checks whether a doctor already has an appointment at a particular date and time while excluding cancelled appointments.

The prescription authorization query searches for an appointment using:

```text
Patient ID
Doctor ID
Appointment Status
```

This allows the service layer to verify whether a valid completed appointment exists before creating a prescription.

---

# Prescription Repository

The Prescription Repository is:

```java
public interface PrescriptionRepository
        extends JpaRepository<Prescription, Long> {
}
```

It provides standard database operations for prescriptions, including:

```java
save()
findAll()
findById()
deleteById()
```

The `PrescriptionService` uses this repository to persist and retrieve prescriptions.

---

# DTO Layer

DTO stands for:

```text
Data Transfer Object
```

A DTO is used to define the data transferred between the client and the application.

The current DTOs are:

```text
AppointmentRequest
PrescriptionRequest
```

DTOs separate API input from JPA entities.

This prevents the client from having to directly construct persistence entities.

---

# Appointment Request DTO

The `AppointmentRequest` contains:

```text
patientId
doctorId
date
time
```

The client provides references to an existing patient and doctor.

The backend then:

1. Finds the patient.
2. Finds the doctor.
3. Checks the doctor's availability.
4. Creates an `Appointment` entity.
5. Sets the initial status to `Scheduled`.
6. Saves the appointment.

The appointment status is controlled by the backend rather than being supplied during appointment creation.

---

# Prescription Request DTO

The `PrescriptionRequest` defines the information required to create a prescription.

It contains:

```text
patientId
doctorId
notes
medicines
```

The medicines collection contains the information for each prescribed medicine:

```text
name
dosage
frequency
duration
```

The client therefore sends prescription information through a DTO instead of directly sending a JPA `Prescription` entity.

The backend uses the patient and doctor IDs to retrieve the corresponding entities before creating the prescription.

---

# Service Layer

The Service Layer contains the application's business logic.

The current services are:

```text
PatientService
DoctorService
AppointmentService
PrescriptionService
```

The basic relationship is:

```text
Controller
    |
    v
Service
    |
    v
Repository
```

The Service Layer acts as the intermediate layer between HTTP requests and database operations.

---

# Patient Service

`PatientService` handles operations related to patients.

Current operations include:

```text
createPatient()
getAllPatients()
getPatientById()
deletePatient()
```

For example:

```java
public Patient createPatient(Patient patient) {
    return patientRepository.save(patient);
}
```

The service receives the patient object and delegates persistence to the repository.

---

# Doctor Service

`DoctorService` handles operations related to doctors.

Current operations include:

```text
createDoctor()
getAllDoctors()
getDoctorById()
deleteDoctor()
```

It uses:

```text
DoctorRepository
```

for database operations.

---

# Appointment Service

`AppointmentService` contains the business logic required to create and manage appointments.

Creating an appointment involves multiple repositories.

The process is:

```text
AppointmentRequest
       |
       v
Find Patient
       |
       v
Find Doctor
       |
       v
Check Doctor Availability
       |
       v
Create Appointment
       |
       v
Set Status = Scheduled
       |
       v
Save Appointment
```

The service therefore coordinates:

```text
PatientRepository
DoctorRepository
AppointmentRepository
```

The service also manages appointment status changes.

---

# Prescription Service

`PrescriptionService` contains the business logic for creating and retrieving prescriptions.

Creating a prescription follows this process:

```text
PrescriptionRequest
       |
       v
Find Patient
       |
       v
Find Doctor
       |
       v
Check Completed Appointment
       |
       v
Create Prescription
       |
       v
Create Prescription Medicines
       |
       v
Save Prescription
```

The service coordinates:

```text
PatientRepository
DoctorRepository
AppointmentRepository
PrescriptionRepository
```

The prescription cannot be created unless the authorization condition is satisfied.

---

# Controller Layer

The Controller Layer is responsible for handling HTTP requests.

The current controllers are:

```text
PatientController
DoctorController
AppointmentController
PrescriptionController
```

Controllers define the public REST API of the application.

They should primarily handle:

* HTTP requests
* Request data
* Path variables
* Request parameters
* Calling services
* Returning responses

Business logic and direct database operations are kept outside the controller.

---

# Patient Controller

The base endpoint is:

```text
/patients
```

Supported operations include:

```text
POST   /patients
GET    /patients
GET    /patients/{id}
DELETE /patients/{id}
```

The controller delegates the actual operations to `PatientService`.

---

# Doctor Controller

The base endpoint is:

```text
/doctors
```

Supported operations include:

```text
POST   /doctors
GET    /doctors
GET    /doctors/{id}
DELETE /doctors/{id}
```

The controller delegates the operations to `DoctorService`.

---

# Appointment Controller

The base endpoint is:

```text
/appointments
```

Supported operations include:

```text
GET  /appointments
POST /appointments
PUT  /appointments/{id}/status
```

The controller delegates appointment operations to `AppointmentService`.

---

# Prescription Controller

The base endpoint is:

```text
/prescriptions
```

Supported operations include:

```text
POST /prescriptions
GET  /prescriptions
```

The controller delegates prescription operations to `PrescriptionService`.

The controller does not directly perform the appointment authorization check. That responsibility belongs to the service layer.

---

# Appointment Booking Logic

Appointment creation follows a defined business flow.

The client sends:

```http
POST /appointments
```

with the required appointment information.

The backend first verifies that the referenced patient exists.

It then verifies that the referenced doctor exists.

After that, the backend checks whether the doctor already has an appointment at the requested date and time.

The availability rule is:

```text
Same Doctor
+
Same Date
+
Same Time
=
Existing Appointment
```

If such an appointment exists and has not been cancelled, the new appointment is rejected.

This allows different doctors to have appointments at the same time.

The booking restriction therefore applies to a specific doctor rather than globally to the time slot.

---

# Appointment Status

New appointments are automatically created with:

```text
Scheduled
```

The application currently supports the following appointment statuses:

```text
Scheduled
Confirmed
Completed
Cancelled
```

The status can be changed using:

```http
PUT /appointments/{id}/status
```

with the status supplied as a request parameter.

The appointment status represents the current stage of the appointment lifecycle.

Conceptually:

```text
Scheduled
    |
    v
Confirmed
    |
    v
Completed
```

An appointment may also be:

```text
Cancelled
```

Cancelled appointments do not prevent the same doctor from being booked for the same date and time again.

---

# Prescription Authorization

Prescription creation contains a business rule that connects prescriptions to appointments.

A doctor can create a prescription for a patient only when that doctor has a **Completed** appointment with that patient.

The backend checks:

```text
Patient ID
+
Doctor ID
+
Appointment Status = Completed
```

The repository query searches for an appointment matching all three conditions.

Conceptually:

```text
Prescription Request
        |
        v
Find Patient
        |
        v
Find Doctor
        |
        v
Search Appointment
        |
        +---- Patient matches
        |
        +---- Doctor matches
        |
        +---- Status = Completed
        |
        v
Authorization successful
        |
        v
Create Prescription
```

If no matching completed appointment exists, the backend rejects the request with:

```text
HTTP 403 Forbidden
```

The response message indicates that the doctor does not have a completed appointment with the patient.

This rule is implemented in the backend so that the business condition is enforced independently of the frontend.

---

# Prescription Creation Flow

The complete prescription creation process is:

```text
Client
  |
  | POST /prescriptions
  v
PrescriptionController
  |
  v
PrescriptionService
  |
  +----> PatientRepository
  |          |
  |          v
  |       Find Patient
  |
  +----> DoctorRepository
  |          |
  |          v
  |       Find Doctor
  |
  +----> AppointmentRepository
  |          |
  |          v
  |       Check Completed Appointment
  |
  v
Authorization Successful
  |
  v
Create Prescription
  |
  v
Create PrescriptionMedicine Objects
  |
  v
PrescriptionRepository
  |
  v
H2 Database
```

The prescription contains:

```text
Patient
Doctor
Notes
Creation timestamp
Medicines
```

Each medicine contains:

```text
Name
Dosage
Frequency
Duration
```

The medicines are associated with the prescription through a one-to-many relationship.

---

# Important Spring Annotations

## `@SpringBootApplication`

```java
@SpringBootApplication
```

Marks the main Spring Boot application class.

---

## `@RestController`

```java
@RestController
```

Marks a class as a REST controller.

---

## `@RequestMapping`

```java
@RequestMapping("/patients")
```

Defines the base URL for a controller.

---

## `@GetMapping`

```java
@GetMapping
```

Handles HTTP GET requests.

---

## `@PostMapping`

```java
@PostMapping
```

Handles HTTP POST requests.

---

## `@PutMapping`

```java
@PutMapping("/{id}/status")
```

Handles HTTP PUT requests.

---

## `@DeleteMapping`

```java
@DeleteMapping("/{id}")
```

Handles HTTP DELETE requests.

---

## `@RequestBody`

```java
@RequestBody PrescriptionRequest request
```

Converts the JSON request body into a Java object.

---

## `@PathVariable`

```java
@PathVariable Long id
```

Extracts a value from the URL.

For example:

```text
GET /patients/{id}
```

allows the patient ID to be read from the URL.

---

## `@RequestParam`

```java
@RequestParam String status
```

Reads a value from the query parameters.

For example:

```text
/appointments/{id}/status?status=Completed
```

provides the appointment status through the query parameter.

---

## `@Service`

```java
@Service
```

Marks a class as a Spring service component.

---

## `@Entity`

```java
@Entity
```

Marks a class as a JPA entity.

---

## `@Id`

```java
@Id
```

Defines the primary key of an entity.

---

## `@GeneratedValue`

```java
@GeneratedValue(strategy = GenerationType.IDENTITY)
```

Configures automatic ID generation.

---

## `@ManyToOne`

```java
@ManyToOne
```

Defines a many-to-one relationship between entities.

The Appointment entity uses this relationship for Patient and Doctor.

The PrescriptionMedicine entity uses it for Prescription.

---

## `@OneToMany`

```java
@OneToMany(...)
```

Defines a one-to-many relationship.

The Prescription entity uses it to maintain its collection of medicines.

---

## `@JoinColumn`

```java
@JoinColumn(name = "doctor_id")
```

Specifies the database column used to store the relationship.

---

## `@JsonIgnore`

```java
@JsonIgnore
```

Prevents a field from being included during JSON serialization.

It is used on the `prescription` field inside `PrescriptionMedicine` to prevent recursive serialization.

---

## `@CrossOrigin`

```java
@CrossOrigin(...)
```

Allows the backend to accept requests from specified frontend origins.

This is required during local development when the frontend and backend run on different ports.

---

# Dependency Injection

The application uses constructor-based dependency injection.

For example:

```java
private final PatientRepository patientRepository;

public PatientService(
        PatientRepository patientRepository) {

    this.patientRepository = patientRepository;
}
```

`PatientService` requires `PatientRepository`.

Spring automatically creates the required repository object and supplies it to the constructor.

This is called:

```text
Constructor Dependency Injection
```

The same approach is used throughout the application.

For example, `PrescriptionService` receives:

```text
PrescriptionRepository
PatientRepository
DoctorRepository
AppointmentRepository
```

through its constructor.

---

# JPA and Hibernate

JPA stands for:

```text
Java Persistence API
```

It provides a standard programming model for persistence in Java applications.

Hibernate is the ORM implementation used by Spring Boot in this project.

The general flow is:

```text
Java Entity
    |
    v
Spring Data JPA
    |
    v
Hibernate
    |
    v
SQL
    |
    v
H2 Database
```

Hibernate maps Java objects to relational database records.

For example:

```text
Java Object                  Database Record

Patient                      patients
-------                      --------
id             ---------->   id
name           ---------->   name
age            ---------->   age
gender         ---------->   gender
phone          ---------->   phone
```

The same principle applies to:

```text
Doctor
Appointment
Prescription
PrescriptionMedicine
```

---

# REST API

The backend follows REST principles and uses HTTP methods to represent operations.

| HTTP Method | Purpose       |
| ----------- | ------------- |
| GET         | Retrieve data |
| POST        | Create data   |
| PATCH       | Partially update data |
| PUT         | Update data   |
| DELETE      | Delete data   |

The backend runs locally on:

```text
http://localhost:8080
```

---

# Patient APIs

## Create Patient

```http
POST /patients
```

The request body contains the patient information required by the API.

---

## Get All Patients

```http
GET /patients
```

---

## Get Patient by ID

```http
GET /patients/{id}
```

---

## Delete Patient

```http
DELETE /patients/{id}
```

---

# Doctor APIs

## Create Doctor

```http
POST /doctors
```

The request body contains the doctor information required by the API.

---

## Get All Doctors

```http
GET /doctors
```

---

## Get Doctor by ID

```http
GET /doctors/{id}
```

---

## Delete Doctor

```http
DELETE /doctors/{id}
```

---

# Appointment APIs

## Create Appointment

```http
POST /appointments
```

The request body contains:

```text
patientId
doctorId
date
time
```

The backend automatically sets:

```text
status = Scheduled
```

The referenced patient and doctor must already exist.

---

## Get All Appointments

```http
GET /appointments
```

This returns the appointments currently stored in the database.

---

## Update Appointment Status

```http
PUT /appointments/{id}/status?status=<status>
```

Supported statuses are:

```text
Scheduled
Confirmed
Completed
Cancelled
```

---

# Prescription APIs

## Create Prescription

```http
POST /prescriptions
```

The request body contains:

```text
patientId
doctorId
notes
medicines
```

Each medicine contains:

```text
name
dosage
frequency
duration
```

Before creating the prescription, the backend verifies that:

```text
Patient exists
        +
Doctor exists
        +
Completed appointment exists
```

If the authorization condition is satisfied, the prescription is saved.

Otherwise, the backend returns:

```text
HTTP 403 Forbidden
```

---

## Get All Prescriptions

```http
GET /prescriptions
```

This returns the prescriptions currently stored in the database.

Each prescription contains its associated patient, doctor, notes, creation timestamp, and medicines.

---

# Bed and Ward APIs

Ward and bed records are stored by the backend and are used directly by the `/beds` frontend page. Bed responses include the ward name and, when occupied, the assigned patient's ID and name.

## Ward APIs

### Create Ward

```http
POST /wards
Content-Type: application/json
```

```json
{
  "name": "Ward A",
  "department": "Cardiology",
  "floor": 2
}
```

Ward names must be unique. The floor must be zero or greater.

### Get All Wards

```http
GET /wards
```

### Delete Ward

```http
DELETE /wards/{id}
```

A ward can only be deleted after all of its beds have been removed.

## Bed APIs

### Create Bed

```http
POST /beds
Content-Type: application/json
```

```json
{
  "bedNumber": "A-01",
  "wardId": 1
}
```

The bed number must be unique within its ward. New beds start with `AVAILABLE` status.

### Get All Beds

```http
GET /beds
```

Each response includes `id`, `bedNumber`, `status`, `wardId`, `wardName`, `patientId`, and `patientName`.

### Assign a Patient

```http
PATCH /beds/{id}/assign
Content-Type: application/json
```

```json
{
  "patientId": 42
}
```

The bed must be available, the patient must exist, and a patient already assigned to another bed cannot be assigned again. Successful assignment sets the bed to `OCCUPIED`.

### Release a Bed

```http
PATCH /beds/{id}/release
```

This clears the patient assignment and sets the bed to `AVAILABLE`. Only occupied beds can be released.

### Change Bed Status

```http
PATCH /beds/{id}/status
Content-Type: application/json
```

```json
{
  "status": "MAINTENANCE"
}
```

Use `AVAILABLE` or `MAINTENANCE`; assignment and release endpoints control the `OCCUPIED` state.

### Delete Bed

```http
DELETE /beds/{id}
```

Occupied beds cannot be deleted. Invalid state transitions and duplicate assignments return an appropriate conflict response.

---

# API Testing

The APIs can be tested using Postman.

Start the backend:

```bash
mvn spring-boot:run
```

The server will be available at:

```text
http://localhost:8080
```

Examples of endpoints to test:

```text
GET  http://localhost:8080/patients
GET  http://localhost:8080/doctors
GET  http://localhost:8080/appointments
GET  http://localhost:8080/prescriptions
```

For POST requests, configure the request body as:

```text
Body
  -> raw
  -> JSON
```

and provide the fields required by the corresponding DTO.

For prescription testing, the patient and doctor must exist and a completed appointment must exist between them.

---

# Running the Backend

## 1. Clone the Repository

```bash
git clone https://github.com/Abhigyan-19/Hospital-Management.git
```

Move into the project directory:

```bash
cd Hospital-Management
```

---

## 2. Verify Java

```bash
java -version
```

The project is configured for Java 21.

---

## 3. Verify Maven

```bash
mvn -version
```

---

## 4. Compile the Project

```bash
mvn clean compile
```

---

## 5. Run the Application

```bash
mvn spring-boot:run
```

The backend should then be available at:

```text
http://localhost:8080
```

H2 uses a file-backed database at `./data/hospital-management.mv.db`, relative to the backend working directory. Ward, bed, patient, and other JPA records therefore remain available after a local backend restart. The `/data/` directory is ignored by Git.

---

# Frontend Integration

The frontend and backend are separate applications.

The architecture is:

```text
React / Vite Frontend
        |
        | HTTP requests using Axios
        |
        v
Spring Boot Backend
        |
        v
H2 Database
```

During local development, the frontend and backend run on different ports.

For example:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
```

The frontend communicates with the backend through REST APIs.

For example:

```text
Frontend
   |
   | POST /appointments
   v
Spring Boot
   |
   v
AppointmentController
   |
   v
AppointmentService
   |
   v
Database
```

For prescription creation:

```text
Frontend
   |
   | POST /prescriptions
   v
Spring Boot
   |
   v
PrescriptionController
   |
   v
PrescriptionService
   |
   +----> AppointmentRepository
   |
   +----> PrescriptionRepository
   |
   v
Database
```

The backend includes CORS configuration to allow requests from the configured frontend development origins.

Beds & Wards always uses the backend API, including for its patient selector. Start Spring Boot to use this page; `VITE_USE_MOCK` does not switch its data to mock records. The frontend supports creating wards and beds, assigning and releasing patients, changing bed availability/maintenance status, filtering, and deleting eligible records.

---

# Running the Frontend

From the frontend project directory:

```bash
npm install
```

Then:

```bash
npm run dev
```

The frontend development server will normally be available at:

```text
http://localhost:5173
```

The backend and frontend are independent processes, so both should be running when testing the complete application.

---

# Maven Commands

Compile the project:

```bash
mvn compile
```

Clean the build:

```bash
mvn clean
```

Clean and compile:

```bash
mvn clean compile
```

Run tests:

```bash
mvn test
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

Package the application:

```bash
mvn package
```

---

# Git and GitHub

Git is used for version control and GitHub is used to host the source code.

Check the current repository status:

```bash
git status
```

Stage changes:

```bash
git add .
```

Create a commit:

```bash
git commit -m "Add prescription management"
```

Push changes to GitHub:

```bash
git push origin main
```

The usual workflow is:

```text
Modify Code
    |
    v
git status
    |
    v
git add .
    |
    v
git commit
    |
    v
git push
    |
    v
GitHub
```

Before committing, it is recommended to check `git status` to make sure that only intended files are being committed.

---

# Gitignore

The `.gitignore` file prevents unnecessary or sensitive files from being committed to the repository.

Common entries include:

```text
.idea/
target/
*.iml
.env
```

These files may contain IDE-specific configuration, generated build files, or environment-specific configuration.

Sensitive information such as passwords, API keys, and database credentials should never be committed to GitHub.

---

# Current Learning Outcomes

This project currently provides practical experience with:

### Java

* Classes and objects
* Constructors
* Interfaces
* Encapsulation
* Packages
* Getters and setters
* Collections

### Spring Boot

* Application configuration
* Dependency Injection
* REST Controllers
* Services
* Component scanning
* CORS
* Business logic
* HTTP request handling

### Spring Data JPA

* `JpaRepository`
* CRUD operations
* Derived query methods
* Entity persistence
* Entity relationships
* Repository-based database access

### Hibernate

* ORM
* Object-relational mapping
* Entity persistence
* Many-to-one relationships
* One-to-many relationships
* Cascading operations

### Database

* H2 Database
* Primary keys
* Foreign keys
* Many-to-one relationships
* One-to-many relationships
* Parent-child entity relationships

### REST API Development

* GET
* POST
* PUT
* DELETE
* Request bodies
* Path variables
* Request parameters
* JSON
* HTTP status codes

### DTOs

* Data Transfer Objects
* Separating API requests from entities
* Passing entity IDs between client and backend
* Structuring nested request data

### Business Logic

* Appointment availability validation
* Appointment status management
* Prescription authorization
* Completed appointment verification
* Relationship-based authorization

### Prescription Management

* Prescription creation
* Prescription retrieval
* Prescription and medicine relationships
* Multiple medicines per prescription
* Prescription authorization based on completed appointments

### Development Tools

* IntelliJ IDEA
* Maven
* Postman
* Git
* GitHub

### Frontend Integration

* React / Vite
* Axios
* Frontend-backend communication
* CORS
* Separate frontend and backend development servers

---

# Future Improvements

The following features can be added as the project develops:

* Patient update functionality
* Doctor update functionality
* Appointment deletion
* Appointment rescheduling
* Doctor availability schedules
* Patient medical records
* Authentication and authorization
* Role-based access control
* JWT authentication
* Input validation
* Global exception handling
* Standardized API error responses
* Pagination
* Sorting and filtering
* Unit testing
* Integration testing
* Swagger/OpenAPI documentation
* PostgreSQL or MySQL integration
* Production deployment
* Docker-based deployment

---

# Application Overview

The current backend can be summarized as:

```text
                    Client
                      |
                      | HTTP
                      v
               +--------------+
               |  Controller  |
               +------+-------+
                      |
                      v
               +--------------+
               |   Service    |
               +------+-------+
                      |
                      v
               +--------------+
               | Repository   |
               +------+-------+
                      |
                      v
               +--------------+
               | JPA/Hibernate|
               +------+-------+
                      |
                      v
               +--------------+
               | H2 Database  |
               +--------------+
```

For appointment creation:

```text
Client
  |
  | AppointmentRequest
  v
AppointmentController
  |
  v
AppointmentService
  |
  +---- PatientRepository
  |
  +---- DoctorRepository
  |
  +---- AppointmentRepository
  |
  v
Database
```

For prescription creation:

```text
Client
  |
  | PrescriptionRequest
  v
PrescriptionController
  |
  v
PrescriptionService
  |
  +---- PatientRepository
  |
  +---- DoctorRepository
  |
  +---- AppointmentRepository
  |          |
  |          v
  |     Completed Appointment
  |
  +---- PrescriptionRepository
  |
  v
Database
```

The separation of these responsibilities makes the application easier to understand, test, maintain, and extend.
