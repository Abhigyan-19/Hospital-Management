package com.hospital.management.notification.entity;

import com.hospital.management.appointment.entity.Appointment;
import com.hospital.management.security.UserAccount;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes =
        @Index(name = "ix_notifications_recipient_read_created", columnList = "recipient_id,read_at,created_at"))
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private UserAccount recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 40)
    private NotificationType notificationType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false, length = 300)
    private String href;

    @Column(name = "deduplication_key", nullable = false, unique = true, length = 300)
    private String deduplicationKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "read_at")
    private LocalDateTime readAt;

    protected Notification() {
    }

    public Notification(
            UserAccount recipient,
            Appointment appointment,
            NotificationType notificationType,
            String title,
            String message,
            String href,
            String deduplicationKey) {
        this.recipient = recipient;
        this.appointment = appointment;
        this.notificationType = notificationType;
        this.title = title;
        this.message = message;
        this.href = href;
        this.deduplicationKey = deduplicationKey;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getHref() {
        return href;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return readAt != null;
    }

    public void markRead() {
        if (readAt == null) {
            readAt = LocalDateTime.now();
        }
    }
}
