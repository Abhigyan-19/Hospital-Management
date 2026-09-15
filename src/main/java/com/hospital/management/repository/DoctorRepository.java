package com.hospital.management.repository;

import com.hospital.management.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}

// we don't need to write methods like saveDoctor() , getDoctor()..
// JpaRepository already provides the basic database operations
// We use an interface for the repository because we don't need to write the database implementation ourselves. Spring Data JPA creates the implementation for us.
// if we write class then we need to write the database coed by ourselves.
// JpaRepository<Doctor, Long>
//             ↑       ↑
//             │       │
//          Entity    ID type
// I want a repository for the Doctor entity, whose primary key is a Long.
