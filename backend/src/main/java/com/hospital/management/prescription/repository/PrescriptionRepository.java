package com.hospital.management.prescription.repository;

import com.hospital.management.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
}