# Hospital Management System

A RESTful Hospital Management System backend developed using Java, Spring Boot, Spring Data JPA, Hibernate, and H2 Database.

The purpose of this project is to understand the fundamentals of Spring Boot backend development and the complete flow of a REST API, from receiving an HTTP request to interacting with the database.

The application currently manages:

* Patients
* Doctors
* Appointments

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
13. [Entity Relationships](#entity-relationships)
14. [Repository Layer](#repository-layer)
15. [Patient Repository](#patient-repository)
16. [Doctor Repository](#doctor-repository)
17. [Appointment Repository](#appointment-repository)
18. [DTO Layer](#dto-layer)
19. [Appointment Request DTO](#appointment-request-dto)
20. [Service Layer](#service-layer)
21. [Patient Service](#patient-service)
22. [Doctor Service](#doctor-service)
23. [Appointment Service](#appointment-service)
24. [Controller Layer](#controller-layer)
25. [Patient Controller](#patient-controller)
26. [Doctor Controller](#doctor-controller)
27. [Appointment Controller](#appointment-controller)
28. [Appointment Booking Logic](#appointment-booking-logic)
29. [Appointment Status](#appointment-status)
30. [Important Spring Annotations](#important-spring-annotations)
31. [Dependency Injection](#dependency-injection)
32. [JPA and Hibernate](#jpa-and-hibernate)
33. [REST API](#rest-api)
34. [Patient APIs](#patient-apis)
35. [Doctor APIs](#doctor-apis)
36. [Appointment APIs](#appointment-apis)
37. [API Testing](#api-testing)
38. [Running the Backend](#running-the-backend)
39. [Frontend Integration](#frontend-integration)
40. [Maven Commands](#maven-commands)
41. [Git and GitHub](#git-and-github)
42. [Gitignore](#gitignore)
43. [Current Learning Outcomes](#current-learning-outcomes)
44. [Future Improvements](#future-improvements)

---

# Project Overview

The Hospital Management System is a Spring Boot REST API that provides backend functionality for managing patients, doctors, and appointments.

The application exposes REST endpoints that can be consumed by:

* Frontend applications
* Postman
* Mobile applications
* Other backend services

The current backend provides CRUD functionality for patients and doctors, along with appointment creation, appointment retrieval, and appointment status management.

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

The project is intentionally structured so that each layer has a clearly defined responsibility.

---

# Technologies Used

| Technology        | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| Java 21           | Programming language                            |
| Spring Boot 3.2.5 | Backend framework                               |
| Spring Web        | REST API development                            |
| Spring Data JPA   | Database access                                 |
| Hibernate         | ORM implementation                              |
| H2 Database       | Relational database                             |
| Maven             | Build and dependency management                 |
| IntelliJ IDEA     | Development environment                         |
| Postman           | API testing                                     |
| Git               | Version control                                 |
| GitHub            | Source code hosting                             |
| React / Vite      | Frontend integration                            |
| Axios             | HTTP communication between frontend and backend |

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
    │   │               ├── controller/
    │   │               │   ├── PatientController.java
    │   │               │   ├── DoctorController.java
    │   │               │   └── AppointmentController.java
    │   │               │
    │   │               ├── dto/
    │   │               │   └── AppointmentRequest.java
    │   │               │
    │   │               ├── entity/
    │   │               │   ├── Patient.java
    │   │               │   ├── Doctor.java
    │   │               │   └── Appointment.java
    │   │               │
    │   │               ├── repository/
    │   │               │   ├── PatientRepository.java
    │   │               │   ├── DoctorRepository.java
    │   │               │   └── AppointmentRepository.java
    │   │               │
    │   │               └── service/
    │   │                   ├── PatientService.java
    │   │                   ├── DoctorService.java
    │   │                   └── AppointmentService.java
    │   │
    │   └── resources/
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

The client sends appointment information containing:

```json
{
    "patientId": 1,
    "doctorId": 1,
    "date": "YYYY-MM-DD",
    "time": "HH:MM"
}
```

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
```

Each entity is mapped to a database table using JPA annotations.

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

For example, a doctor's specialization may be:

```text
Cardiology
Neurology
Orthopedics
```

The actual values are stored in the database and are not hard-coded into the application.

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

Unlike a simple string-based model, the appointment does not store patient and doctor names directly.

Instead, it maintains relationships with the `Patient` and `Doctor` entities:

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

# Entity Relationships

The application currently has the following relationship:

```text
Patient 1 -------- * Appointment * -------- 1 Doctor
```

This means:

* One patient can have multiple appointments.
* One doctor can have multiple appointments.
* Each appointment belongs to one patient.
* Each appointment belongs to one doctor.

The corresponding database structure can be represented conceptually as:

```text
patients
---------
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
```

`patient_id` and `doctor_id` act as references to the corresponding records.

---

# Repository Layer

The Repository Layer is responsible for database access.

The current repositories are:

```text
PatientRepository
DoctorRepository
AppointmentRepository
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

In addition to standard CRUD operations, it contains a custom derived query method used to check doctor availability:

```java
boolean existsByDoctorIdAndDateAndTimeAndStatusNot(
        Long doctorId,
        String date,
        String time,
        String status
);
```

This checks whether an appointment already exists for a specific:

```text
Doctor
Date
Time
```

while excluding a specified status, which is currently used to exclude cancelled appointments.

---

# Why Repository is an Interface

A repository is defined as an interface because Spring Data JPA provides the implementation automatically.

For example:

```java
public interface PatientRepository
        extends JpaRepository<Patient, Long> {
}
```

There is no need to manually create an implementation such as:

```text
PatientRepositoryImpl
```

for standard CRUD operations.

Spring Data JPA generates the required implementation at runtime.

---

# DTO Layer

DTO stands for:

```text
Data Transfer Object
```

A DTO is used to define the data transferred between the client and the application.

The current project contains:

```text
dto/
└── AppointmentRequest.java
```

The appointment request DTO separates the API input from the JPA entity.

This is useful because the client should provide the IDs of the patient and doctor rather than constructing complete `Patient` and `Doctor` objects.

---

# Appointment Request DTO

The `AppointmentRequest` contains:

```java
private Long patientId;
private Long doctorId;
private String date;
private String time;
```

The client therefore sends:

```json
{
    "patientId": 1,
    "doctorId": 1,
    "date": "YYYY-MM-DD",
    "time": "HH:MM"
}
```

The backend then:

1. Finds the patient using `patientId`.
2. Finds the doctor using `doctorId`.
3. Checks the doctor's availability.
4. Creates an `Appointment` entity.
5. Sets the initial status to `Scheduled`.
6. Saves the appointment.

The client does not directly provide:

```text
appointmentId
patient object
doctor object
status
```

These are handled by the backend.

---

# Service Layer

The Service Layer contains the application's business logic.

The current services are:

```text
PatientService
DoctorService
AppointmentService
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

---

# Controller Layer

The Controller Layer is responsible for handling HTTP requests.

The current controllers are:

```text
PatientController
DoctorController
AppointmentController
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

# Appointment Booking Logic

Appointment creation follows a defined business flow.

The client sends:

```http
POST /appointments
```

with:

```json
{
    "patientId": 1,
    "doctorId": 1,
    "date": "YYYY-MM-DD",
    "time": "HH:MM"
}
```

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

For example:

```text
Doctor A -> 09:30 -> Booked
Doctor B -> 09:30 -> Available
```

The booking restriction therefore applies to a specific doctor rather than globally to the time slot.

---

# Appointment Status

New appointments are automatically created with:

```text
Scheduled
```

The current status values used by the application are:

```text
Scheduled
Completed
Cancelled
```

The status can be changed using:

```http
PUT /appointments/{id}/status
```

with the status supplied as a request parameter.

For example:

```text
PUT /appointments/{id}/status?status=Completed
```

or:

```text
PUT /appointments/{id}/status?status=Cancelled
```

Cancelled appointments do not prevent the same doctor from being booked for that date and time again.

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
@RequestBody AppointmentRequest request
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
GET /patients/10
```

results in:

```text
id = 10
```

---

## `@RequestParam`

```java
@RequestParam String status
```

Reads a value from the query parameters.

For example:

```text
/appointments/1/status?status=Completed
```

results in:

```text
status = Completed
```

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

The Appointment entity uses this relationship for both Patient and Doctor.

---

## `@JoinColumn`

```java
@JoinColumn(name = "doctor_id")
```

Specifies the database column used to store the relationship.

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

---

# REST API

The backend follows REST principles and uses HTTP methods to represent operations.

| HTTP Method | Purpose       |
| ----------- | ------------- |
| GET         | Retrieve data |
| POST        | Create data   |
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

Request body:

```json
{
    "name": "<patient-name>",
    "age": 0,
    "gender": "<gender>",
    "phone": "<phone-number>"
}
```

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

Request body:

```json
{
    "name": "<doctor-name>",
    "specialization": "<specialization>",
    "experience": 0
}
```

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

Request body:

```json
{
    "patientId": 0,
    "doctorId": 0,
    "date": "YYYY-MM-DD",
    "time": "HH:MM"
}
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

Supported statuses currently include:

```text
Scheduled
Completed
Cancelled
```

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
GET    http://localhost:8080/patients
GET    http://localhost:8080/doctors
GET    http://localhost:8080/appointments
```

For POST requests, configure the request body as:

```text
Body
  -> raw
  -> JSON
```

and provide the required JSON payload.

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

The backend includes CORS configuration to allow requests from the configured frontend development origins.

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
git commit -m "Add appointment booking functionality"
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

### Spring Boot

* Application configuration
* Dependency Injection
* REST Controllers
* Services
* Component scanning
* CORS

### Spring Data JPA

* `JpaRepository`
* CRUD operations
* Repository query methods
* Entity persistence

### Hibernate

* ORM
* Object-relational mapping
* Entity persistence
* Entity relationships

### Database

* H2 Database
* Primary keys
* Foreign keys
* Many-to-one relationships

### REST API Development

* GET
* POST
* PUT
* DELETE
* Request bodies
* Path variables
* Request parameters
* JSON

### DTOs

* Data Transfer Objects
* Separating API requests from entities
* Passing entity IDs between client and backend

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
* Prescriptions
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

The separation of these responsibilities makes the application easier to understand, test, maintain, and extend.
