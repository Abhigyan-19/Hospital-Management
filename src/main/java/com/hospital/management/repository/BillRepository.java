package com.hospital.management.repository;

import com.hospital.management.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByPatient_IdOrderByCreatedAtDesc(Long patientId);
    List<Bill> findAllByOrderByCreatedAtDesc();
}

