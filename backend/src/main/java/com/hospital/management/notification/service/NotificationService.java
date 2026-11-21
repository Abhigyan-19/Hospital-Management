package com.hospital.management.notification.service;

import com.hospital.management.appointment.entity.Appointment;
import com.hospital.management.notification.dto.NotificationResponse;
import com.hospital.management.notification.entity.Notification;
import com.hospital.management.notification.entity.NotificationType;
import com.hospital.management.notification.repository.NotificationRepository;
import com.hospital.management.security.UserAccount;
import com.hospital.management.security.UserAccountRepository;
import com.hospital.management.security.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userAccountRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserAccountRepository userAccountRepository) {
        this.notificationRepository = notificationRepository;
        this.userAccountRepository = userAccountRepository;
    }

    private List<UserAccount> activeAdmins() {
        List<UserAccount> admins = userAccountRepository.findByRoleAndActiveTrue(UserRole.ADMIN);
        if (admins.isEmpty()) {
            throw new IllegalStateException("At least one active administrator account is required for appointment notifications.");
        }
        return admins;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listMine(Long accountId) {
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(accountId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long accountId) {
        return notificationRepository.countByRecipient_IdAndReadAtIsNull(accountId);
    }

    @Transactional
    public NotificationResponse markRead(Long accountId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndRecipient_Id(notificationId, accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        notification.markRead();
        return toResponse(notification);
    }

    @Transactional
    public void appointmentApproved(Appointment appointment) {
        String details = describe(appointment);
        create(appointment.getPatient().getOwnerAccount(), appointment, NotificationType.APPOINTMENT_APPROVED,
                "Appointment approved", details, "/my-appointments", "approved");
        create(appointment.getDoctor().getAccount(), appointment, NotificationType.APPOINTMENT_APPROVED,
                "Appointment approved", details, "/doctor/schedule", "approved");
        for (UserAccount admin : activeAdmins()) {
            create(admin, appointment, NotificationType.APPOINTMENT_APPROVED,
                    "Appointment approved", details, "/appointments", "approved");
        }
    }

    @Transactional
    public void appointmentRejected(Appointment appointment, String reason) {
        String details = describe(appointment);
        if (reason != null && !reason.isBlank()) {
            details += " Reason: " + reason.trim();
        }
        create(appointment.getPatient().getOwnerAccount(), appointment, NotificationType.APPOINTMENT_REJECTED,
                "Appointment request declined", details, "/my-appointments", "rejected");
        for (UserAccount admin : activeAdmins()) {
            create(admin, appointment, NotificationType.APPOINTMENT_REJECTED,
                    "Appointment request declined", details, "/appointments", "rejected");
        }
    }

    @Transactional
    public void appointmentRescheduled(Appointment appointment, long historyId) {
        String details = describe(appointment);
        if (appointment.getPatient().getOwnerAccount() != null) {
            create(appointment.getPatient().getOwnerAccount(), appointment, NotificationType.APPOINTMENT_RESCHEDULED,
                    "Appointment rescheduled", details, "/my-appointments", "rescheduled:" + historyId);
        }
        create(appointment.getDoctor().getAccount(), appointment, NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment rescheduled", details, "/doctor/schedule", "rescheduled:" + historyId);
        for (UserAccount admin : activeAdmins()) {
            create(admin, appointment, NotificationType.APPOINTMENT_RESCHEDULED,
                    "Appointment rescheduled", details, "/appointments", "rescheduled:" + historyId);
        }
    }

    @Transactional
    public void appointmentCancelled(Appointment appointment) {
        String details = describe(appointment);
        if (appointment.getPatient().getOwnerAccount() != null) {
            create(appointment.getPatient().getOwnerAccount(), appointment, NotificationType.APPOINTMENT_CANCELLED,
                    "Appointment cancelled", details, "/my-appointments", "cancelled");
        }
        if (appointment.getDoctor().getAccount() != null) {
            create(appointment.getDoctor().getAccount(), appointment, NotificationType.APPOINTMENT_CANCELLED,
                    "Appointment cancelled", details, "/doctor/schedule", "cancelled");
        }
        for (UserAccount admin : activeAdmins()) {
            create(admin, appointment, NotificationType.APPOINTMENT_CANCELLED,
                    "Appointment cancelled", details, "/appointments", "cancelled");
        }
    }

    @Transactional
    public void appointmentCompleted(Appointment appointment) {
        String details = describe(appointment);
        if (appointment.getPatient().getOwnerAccount() != null) {
            create(appointment.getPatient().getOwnerAccount(), appointment, NotificationType.APPOINTMENT_COMPLETED,
                    "Appointment completed", details, "/my-appointments", "completed");
        }
        for (UserAccount admin : activeAdmins()) {
            create(admin, appointment, NotificationType.APPOINTMENT_COMPLETED,
                    "Appointment completed", details, "/appointments", "completed");
        }
    }

    private void create(
            UserAccount recipient,
            Appointment appointment,
            NotificationType type,
            String title,
            String message,
            String href,
            String event) {
        if (recipient == null) {
            throw new IllegalStateException("Appointment notification recipient is not linked to an account.");
        }
        String deduplicationKey = "appointment:" + appointment.getId() + ":" + event + ":" + recipient.getId();
        notificationRepository.save(new Notification(recipient, appointment, type, title, message, href, deduplicationKey));
    }

    private String describe(Appointment appointment) {
        return appointment.getPatient().getName() + " with Dr. " + appointment.getDoctor().getName()
                + " on " + appointment.getDate() + " at " + appointment.getTime();
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getHref(),
                notification.getCreatedAt(),
                notification.isRead());
    }
}
