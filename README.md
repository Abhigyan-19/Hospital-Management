# 🏥 Hospital Management System

A beginner-friendly **Hospital Management System REST API** built using **Java, Spring Boot, Spring Data JPA, Hibernate, and H2 Database**.

The main purpose of this project is not only to build a hospital API, but also to understand how a **Spring Boot backend application works internally**, starting from the HTTP request and going all the way to the database.

---

# 📌 Table of Contents

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

# 📖 Project Overview

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

# 🎯 Project Goals

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

# 🛠 Technologies Used

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

# 💻 Prerequisites

Before running this project, install:

1. Java JDK 21
2. Maven
3. IntelliJ IDEA or another Java IDE
4. Git
5. Postman (optional, but recommended)

---

# 📁 Project Structure

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
