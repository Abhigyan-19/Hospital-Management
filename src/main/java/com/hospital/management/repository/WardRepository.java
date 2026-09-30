package com.hospital.management.repository;

import com.hospital.management.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WardRepository extends JpaRepository<Ward, Long> {
    boolean existsByNameIgnoreCase(String name);
}