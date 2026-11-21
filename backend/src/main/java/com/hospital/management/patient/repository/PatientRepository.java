package com.hospital.management.patient.repository;

import com.hospital.management.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository
        extends JpaRepository<Patient, Long> {
    java.util.List<Patient> findByOwnerAccount_IdOrderByIdAsc(Long accountId);

    java.util.Optional<Patient> findByIdAndOwnerAccount_Id(Long id, Long accountId);

}