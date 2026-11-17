package com.hospital.management.ward.repository;

import com.hospital.management.ward.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WardRepository extends JpaRepository<Ward, Long> {
    boolean existsByNameIgnoreCase(String name);
}