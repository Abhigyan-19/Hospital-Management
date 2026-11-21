package com.hospital.management.notification.repository;

import com.hospital.management.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipient_IdAndReadAtIsNull(Long recipientId);

    Optional<Notification> findByIdAndRecipient_Id(Long id, Long recipientId);
}
