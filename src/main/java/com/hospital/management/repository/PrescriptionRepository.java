package com.hospital.management.repository;

import com.hospital.management.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByDoctor_Id(Long doctorId);
    List<Prescription> findByPatient_Id(Long patientId);
}
