#  Hospital Management System

A beginner-friendly **Hospital Management System REST API** built using **Java, Spring Boot, Spring Data JPA, Hibernate, and H2 Database**.

The main purpose of this project is not only to build a hospital API, but also to understand how a **Spring Boot backend application works internally**, starting from the HTTP request and going all the way to the database.

---

#  Table of Contents

1. [Project Overview](#-project-overview)
2. [Project Goals](#-project-goals)
3. [Technologies Used](#-technologies-used)
4. [Prerequisites](#-prerequisites)
5. [Project Structure](#-project-structure)
6. [Architecture](#-architecture)
7. [Understanding the Request Flow](#-understanding-the-request-flow)
8. [Maven](#-maven)
9. [pom.xml Explained](#-pomxml-explained)
10. [Spring Boot Application](#-spring-boot-application)
11. [Entity Layer](#-entity-layer)
12. [Patient Entity](#-patient-entity)
13. [Doctor Entity](#-doctor-entity)
14. [Repository Layer](#-repository-layer)
15. [Why Repository is an Interface](#-why-repository-is-an-interface)
16. [Patient Repository](#-patient-repository)
17. [Doctor Repository](#-doctor-repository)
18. [Service Layer](#-service-layer)
19. [Patient Service](#-patient-service)
20. [Doctor Service](#-doctor-service)
21. [Controller Layer](#-controller-layer)
22. [Patient Controller](#-patient-controller)
23. [Doctor Controller](#-doctor-controller)
24. [Important Spring Annotations](#-important-spring-annotations)
25. [Dependency Injection](#-dependency-injection)
26. [JPA and Hibernate](#-jpa-and-hibernate)
27. [REST API](#-rest-api)
28. [Patient APIs](#-patient-apis)
29. [Doctor APIs](#-doctor-apis)
30. [Testing APIs](#-testing-apis)
31. [Running the Project](#-running-the-project)
32. [Common Maven Commands](#-common-maven-commands)
33. [Git and GitHub](#-git-and-github)
34. [Gitignore](#-gitignore)
35. [What I Have Learned](#-what-i-have-learned)
36. [Future Improvements](#-future-improvements)

---

#  Project Overview

The **Hospital Management System** is a backend REST API that allows us to manage:

- Patients
- Doctors

Currently, the application supports basic CRUD operations.

CRUD means:

| Operation | Meaning | HTTP Method |
|---|---|---|
| Create | Add new data | POST |
| Read | Get data | GET |
| Update | Modify data | PUT/PATCH |
| Delete | Remove data | DELETE |

At the current stage, the project supports:

- Create Patient
- Get all Patients
- Get Patient by ID
- Delete Patient
- Create Doctor
- Get all Doctors
- Get Doctor by ID
- Delete Doctor

---

#  Project Goals

The main goal of this project is to understand the fundamentals of **Spring Boot backend development**.

Through this project, I am learning:

- Java backend development
- Spring Boot
- REST APIs
- HTTP methods
- Controllers
- Services
- Repositories
- Interfaces
- Dependency Injection
- JPA
- Hibernate
- Entities
- H2 Database
- Maven
- Project structure
- Postman API testing
- Git
- GitHub

The project is intentionally kept simple so that every layer can be understood properly.

---

#  Technologies Used

| Technology | Purpose |
|---|---|
| Java 21 | Programming language |
| Spring Boot 3.2.5 | Backend framework |
| Spring Web | Creating REST APIs |
| Spring Data JPA | Database operations |
| Hibernate | ORM implementation |
| H2 Database | Database |
| Maven | Build and dependency management |
| IntelliJ IDEA | IDE |
| Postman | API testing |
| Git | Version control |
| GitHub | Code hosting |

---

#  Prerequisites

Before running this project, install:

1. Java JDK 21
2. Maven
3. IntelliJ IDEA or another Java IDE
4. Git
5. Postman (optional, but recommended)

---

#  Project Structure

The current project structure is:

```text
hospital_management
│
├── .gitignore
├── pom.xml
│
├── .idea/
│
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
    │   │               │   └── DoctorController.java
    │   │               │
    │   │               ├── entity/
    │   │               │   ├── Patient.java
    │   │               │   └── Doctor.java
    │   │               │
    │   │               ├── repository/
    │   │               │   ├── PatientRepository.java
    │   │               │   └── DoctorRepository.java
    │   │               │
    │   │               └── service/
    │   │                   ├── PatientService.java
    │   │                   └── DoctorService.java
    │   │
    │   └── resources/
    │
    └── test/



 





#  Layers of the Hospital Management System

The application follows a **Layered Architecture**. Each layer has a specific responsibility.

The main layers are:

```text
┌──────────────────────────┐
│       Controller         │
│   Handles HTTP Requests  │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────┐
│         Service          │
│    Business Logic        │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────┐
│       Repository         │
│     Database Access      │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────┐
│       Entity / Model     │
│    Represents Data       │
└──────────────────────────┘
```

---

# 1.  Controller Layer

## What is the Controller Layer?

The **Controller Layer** is the entry point of our backend application.

It receives requests from clients such as:

* Postman
* Frontend applications
* Mobile applications
* Web browsers
* Other backend services

The controller determines **which operation needs to be performed** and passes the request to the appropriate service.

---

## Location

```text
src/main/java/com/hospital/management/controller/
```

Current controllers:

```text
controller/
│
├── PatientController.java
└── DoctorController.java
```

---

## Main Responsibility

The Controller Layer is responsible for:

* Receiving HTTP requests
* Defining API endpoints
* Reading request data
* Reading path variables
* Calling the Service Layer
* Returning responses to the client

The controller should generally **not contain business logic or database logic**.

---

## Example

```java
@RestController
@RequestMapping("/patients")
public class PatientController {
```

This creates a REST controller whose base URL is:

```text
/patients
```

Therefore, if we write:

```java
@GetMapping
```

the endpoint becomes:

```text
GET /patients
```

---

## Controller Request Flow

Suppose the client sends:

```text
GET /patients
```

The flow is:

```text
Client
   ↓
PatientController
   ↓
PatientService
```

The controller receives the request and asks the service to retrieve the patients.

---

## Important Controller Annotations

### `@RestController`

```java
@RestController
```

Tells Spring that the class is a REST controller.

It allows methods inside the class to handle HTTP requests and return data, commonly as JSON.

---

### `@RequestMapping`

```java
@RequestMapping("/patients")
```

Defines the base URL for the controller.

For example:

```text
@RequestMapping("/patients")
        +
@GetMapping
        =
GET /patients
```

---

### `@PostMapping`

```java
@PostMapping
```

Handles HTTP POST requests.

Used when creating a new patient or doctor.

Example:

```text
POST /patients
```

---

### `@GetMapping`

```java
@GetMapping
```

Handles HTTP GET requests.

Used to retrieve data.

Example:

```text
GET /patients
```

---

### `@GetMapping("/{id}")`

```java
@GetMapping("/{id}")
```

Handles requests containing an ID.

Example:

```text
GET /patients/5
```

Here:

```text
5
```

is the patient's ID.

---

### `@DeleteMapping`

```java
@DeleteMapping("/{id}")
```

Handles DELETE requests.

Example:

```text
DELETE /patients/5
```

This requests deletion of patient ID 5.

---

### `@RequestBody`

```java
@RequestBody Patient patient
```

Converts JSON request data into a Java object.

For example, the client sends:

```json
{
    "name": "Rahul",
    "age": 25,
    "disease": "Fever"
}
```

Spring converts this JSON into:

```text
Patient object
```

which can then be passed to the service.

---

### `@PathVariable`

```java
@PathVariable Long id
```

Gets a value from the URL.

For:

```text
GET /patients/10
```

Spring extracts:

```text
id = 10
```

---

## Example Controller

```java
@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientService.createPatient(patient);
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
    }
}
```

---

## What the Controller Should NOT Do

The controller should not normally contain code such as:

```java
// Database code
patientRepository.findAll();
```

or complicated business rules such as:

```java
// Complex business logic
if (patient.getAge() > 60 && ...) {
    ...
}
```

Instead:

```text
Controller
    ↓
Service
    ↓
Repository
```

---

# 2.  Service Layer

## What is the Service Layer?

The **Service Layer** contains the application's **business logic**.

It sits between the Controller and Repository.

```text
Controller
    ↓
Service
    ↓
Repository
```

The Controller receives the request, but the Service decides **what should actually happen**.

---

## Location

```text
src/main/java/com/hospital/management/service/
```

Current services:

```text
service/
│
├── PatientService.java
└── DoctorService.java
```

---

## Main Responsibility

The Service Layer is responsible for:

* Implementing business logic
* Processing data
* Applying business rules
* Calling repositories
* Coordinating multiple repositories if necessary
* Returning processed results to controllers

---

## Why Do We Need a Service Layer?

We could technically do this:

```text
Controller → Repository
```

But this becomes problematic when the application becomes larger.

For example:

```text
Controller
    ↓
Repository
```

would force the controller to handle:

* HTTP requests
* Business logic
* Database operations
* Validation
* Calculations

Instead, we separate responsibilities:

```text
Controller
    ↓
Service
    ↓
Repository
```

This makes the code cleaner and easier to maintain.

---

## `@Service`

```java
@Service
```

This tells Spring:

> This class is a Service component and should be managed by the Spring container.

Spring creates and manages an object of this class.

---

## Dependency Injection in Service

```java
private final PatientRepository patientRepository;
```

The `PatientService` needs `PatientRepository`.

Therefore, `PatientRepository` is a dependency of `PatientService`.

The constructor receives it:

```java
public PatientService(PatientRepository patientRepository) {
    this.patientRepository = patientRepository;
}
```

Spring automatically provides the repository object.

This is called:

```text
Constructor Dependency Injection
```

---

## Creating a Patient

```java
public Patient createPatient(Patient patient) {
    return patientRepository.save(patient);
}
```

The process is:

```text
PatientController
       ↓
PatientService
       ↓
patientRepository.save()
       ↓
Database
```

The Service receives the patient and asks the Repository to save it.

---

## Getting All Patients

```java
public List<Patient> getAllPatients() {
    return patientRepository.findAll();
}
```

`findAll()` comes from `JpaRepository`.

It retrieves all patient records.

The return type is:

```java
List<Patient>
```

because multiple patients can exist.

---

## Getting Patient By ID

```java
public Patient getPatientById(Long id) {
    return patientRepository.findById(id)
            .orElse(null);
}
```

The repository searches for a patient using the ID.

```java
findById(id)
```

returns an `Optional<Patient>`.

Then:

```java
.orElse(null)
```

means:

```text
If patient exists:
    return patient

If patient doesn't exist:
    return null
```

---

## Deleting a Patient

```java
public void deletePatient(Long id) {
    patientRepository.deleteById(id);
}
```

The Service tells the Repository to delete the patient.

---

## Example Service

```java
@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElse(null);
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
```

---

# 3.  Repository Layer

## What is the Repository Layer?

The **Repository Layer** is responsible for communicating with the database.

It provides methods for:

* Saving data
* Retrieving data
* Searching by ID
* Deleting data
* Updating data

In this project, we use **Spring Data JPA**.

---

## Location

```text
src/main/java/com/hospital/management/repository/
```

Current repositories:

```text
repository/
│
├── PatientRepository.java
└── DoctorRepository.java
```

---

## Main Responsibility

The Repository Layer handles:

```text
Java Objects
      ↓
JPA / Hibernate
      ↓
Database
```

The Service does not need to know how SQL is written.

It simply calls repository methods.

---

# Patient Repository

```java
public interface PatientRepository
        extends JpaRepository<Patient, Long> {
}
```

This single interface gives us many database operations.

---

# `interface`

```java
public interface PatientRepository
```

A repository is defined as an interface because Spring Data JPA automatically provides its implementation.

We don't manually write the implementation class.

---

# `JpaRepository`

```java
extends JpaRepository<Patient, Long>
```

`JpaRepository` is provided by Spring Data JPA.

It provides many ready-made database methods.

The first generic type:

```text
Patient
```

means the repository works with the `Patient` entity.

The second:

```text
Long
```

means the entity's ID is of type `Long`.

Therefore:

```text
JpaRepository<Patient, Long>

Patient → Entity
Long    → ID type
```

---

# Repository Methods

Because `PatientRepository` extends `JpaRepository`, it automatically receives methods such as:

```java
save()
```

```java
findAll()
```

```java
findById()
```

```java
deleteById()
```

and many others.

---

## `save()`

```java
patientRepository.save(patient);
```

Saves the patient into the database.

---

## `findAll()`

```java
patientRepository.findAll();
```

Retrieves all patients.

---

## `findById()`

```java
patientRepository.findById(id);
```

Searches for a patient by ID.

---

## `deleteById()`

```java
patientRepository.deleteById(id);
```

Deletes a patient by ID.

---

# Why Don't We Write SQL?

Normally, database operations might involve SQL:

```sql
SELECT * FROM patient;
```

But Spring Data JPA allows us to write:

```java
patientRepository.findAll();
```

Spring Data JPA and Hibernate handle the database interaction.

This is one of the main benefits of using Spring Data JPA.

---

# Doctor Repository

The Doctor Repository is:

```java
public interface DoctorRepository
        extends JpaRepository<Doctor, Long> {
}
```

The difference is:

```text
PatientRepository
        ↓
Patient entity

DoctorRepository
        ↓
Doctor entity
```

---

# 4.  Entity Layer

## What is the Entity Layer?

The **Entity Layer** represents the data of the application.

An Entity is a Java class that is mapped to a database table using JPA.

For example:

```java
@Entity
public class Doctor {
```

means the `Doctor` class represents persistent database data.

---

## Location

```text
src/main/java/com/hospital/management/entity/
```

Current entities:

```text
entity/
│
├── Patient.java
└── Doctor.java
```

---

# `@Entity`

```java
@Entity
```

This tells JPA:

> This Java class should be treated as a database entity.

For example:

```java
@Entity
public class Doctor
```

can represent a database table for doctors.

Conceptually:

```text
Java

Doctor
----------------
id
name
specialization
experience


Database

doctor
--------------------------------
id | name | specialization | experience
```

---

# Primary Key

Inside the entity:

```java
@Id
private Long id;
```

`@Id` tells JPA that this field is the **primary key**.

A primary key uniquely identifies a database record.

Example:

```text
id
---
1
2
3
4
```

Each doctor can have a unique ID.

---

# Automatically Generated ID

```java
@GeneratedValue(strategy = GenerationType.IDENTITY)
```

This tells JPA/database to generate the ID automatically.

Therefore, while creating a doctor, we don't need to manually provide the ID.

We can send:

```json
{
    "name": "Dr. Sharma",
    "specialization": "Cardiology",
    "experience": 10
}
```

The database can generate:

```text
id = 1
```

---

# Entity Fields

For the Doctor entity:

```java
private Long id;

private String name;
private String specialization;
private int experience;
```

These fields represent the doctor's data.

Example:

```text
id             = 1
name           = Dr. Sharma
specialization = Cardiology
experience     = 10
```

---

# Constructors

The entity contains two constructors.

## No-Argument Constructor

```java
public Doctor() {
}
```

This creates an empty Doctor object.

Hibernate/JPA requires a no-argument constructor to instantiate entity objects.

---

## Parameterized Constructor

```java
public Doctor(
        String name,
        String specialization,
        int experience
) {
    this.name = name;
    this.specialization = specialization;
    this.experience = experience;
}
```

This allows us to create a Doctor object with values.

Example:

```java
Doctor doctor = new Doctor(
    "Dr. Sharma",
    "Cardiology",
    10
);
```

---

# Getters

Example:

```java
public String getName() {
    return name;
}
```

A getter retrieves the value of a field.

Example:

```java
doctor.getName();
```

returns:

```text
Dr. Sharma
```

---

# Setters

Example:

```java
public void setName(String name) {
    this.name = name;
}
```

A setter changes the value of a field.

Example:

```java
doctor.setName("Dr. Roy");
```

Now:

```text
name = Dr. Roy
```

---

# Why Are Fields Private?

The entity fields are declared:

```java
private
```

For example:

```java
private String name;
```

This is an example of **encapsulation**.

Instead of allowing direct access:

```java
doctor.name
```

we use:

```java
doctor.getName();
```

and:

```java
doctor.setName(...);
```

This gives us better control over how data is accessed and modified.

---

#  Complete Layer Relationship

The four main layers work together:

```text
┌─────────────────────────────┐
│        CONTROLLER           │
│                             │
│ Receives HTTP Request       │
│ Returns HTTP Response       │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│          SERVICE            │
│                             │
│ Business/Application Logic  │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│        REPOSITORY           │
│                             │
│ Database Access             │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│           ENTITY            │
│                             │
│ Represents Database Data    │
└─────────────────────────────┘
```

---

#  Complete Example: Creating a Patient

Suppose Postman sends:

```http
POST /patients
```

with:

```json
{
    "name": "Rahul",
    "age": 25,
    "disease": "Fever"
}
```

## Step 1 — Controller

The request reaches:

```java
@PostMapping
public Patient createPatient(@RequestBody Patient patient)
```

Spring converts the JSON into a `Patient` object.

---

## Step 2 — Service

The Controller calls:

```java
patientService.createPatient(patient);
```

The Service receives the Patient.

---

## Step 3 — Repository

The Service calls:

```java
patientRepository.save(patient);
```

---

## Step 4 — JPA/Hibernate

Spring Data JPA and Hibernate handle the persistence operation.

---

## Step 5 — Database

The patient is stored in the database.

Conceptually:

```text
Patient Table

id | name  | age | disease
---------------------------
1  | Rahul | 25  | Fever
```

---

## Step 6 — Response

The saved Patient travels back:

```text
Database
    ↓
Repository
    ↓
Service
    ↓
Controller
    ↓
JSON Response
```

Example:

```json
{
    "id": 1,
    "name": "Rahul",
    "age": 25,
    "disease": "Fever"
}
```

---

#  Responsibilities at a Glance

| Layer      | Main Responsibility  | Example           |
| ---------- | -------------------- | ----------------- |
| Controller | Handle HTTP requests | `POST /patients`  |
| Service    | Business logic       | `createPatient()` |
| Repository | Database access      | `save()`          |
| Entity     | Represent data       | `Patient`         |

---

#  What Each Layer Should Avoid

## Controller

Should avoid:

```text
Complex business logic
Direct database operations
```

---

## Service

Should avoid:

```text
HTTP-specific handling
```

The Service should not need to know whether the request came from Postman, a browser, or a mobile app.

---

## Repository

Should avoid:

```text
Business logic
HTTP handling
```

Its primary purpose is data access.

---

## Entity

Should primarily represent:

```text
Application data
Database mapping
```

It should not become a place for handling HTTP requests.

---



In our application:

```text
Patient/User
      ↓
Controller
      ↓
Service
      ↓
Repository
      ↓
Database
```

### Controller = Receptionist

Receives the request.

### Service = Hospital Staff

Decides what needs to happen.

### Repository = Database Clerk

Gets or stores information.

### Entity = Patient/Doctor Record

Represents the actual data.

---


