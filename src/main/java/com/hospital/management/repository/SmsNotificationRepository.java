package com.hospital.management.repository;

import com.hospital.management.entity.SmsNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsNotificationRepository extends JpaRepository<SmsNotification, Long> {
    List<SmsNotification> findByPatient_IdOrderBySentAtDesc(Long patientId);
    List<SmsNotification> findAllByOrderBySentAtDesc();
}

