package com.hospital.management.repository;

import com.hospital.management.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BedRepository extends JpaRepository<Bed, Long> {
    boolean existsByWard_Id(Long wardId);

    boolean existsByWard_IdAndBedNumberIgnoreCase(Long wardId, String bedNumber);

    boolean existsByPatient_Id(Long patientId);
}