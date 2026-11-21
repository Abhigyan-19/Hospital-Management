package com.hospital.management.repository;

import com.hospital.management.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    Optional<DoctorAvailability> findByDoctor_Id(Long doctorId);
}
