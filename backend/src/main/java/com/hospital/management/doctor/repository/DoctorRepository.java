package com.hospital.management.doctor.repository;

import com.hospital.management.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    java.util.Optional<Doctor> findByAccount_Id(Long accountId);

    java.util.List<Doctor> findByApprovalStatusIgnoreCase(String approvalStatus);

    boolean existsByAccount_Id(Long accountId);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select doctor from Doctor doctor where doctor.id = :id")
    java.util.Optional<Doctor> findByIdForUpdate(@Param("id") Long id);
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
