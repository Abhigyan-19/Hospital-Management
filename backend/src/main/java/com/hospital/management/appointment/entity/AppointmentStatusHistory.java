package com.hospital.management.appointment.entity;

import com.hospital.management.security.UserAccount;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointment_status_history", indexes =
        @Index(name = "ix_appointment_history_appointment", columnList = "appointment_id,changed_at"))
public class AppointmentStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 20)
    private AppointmentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 20)
    private AppointmentStatus newStatus;

    @Column(name = "previous_date")
    private LocalDate previousDate;

    @Column(name = "previous_time")
    private LocalTime previousTime;

    @Column(name = "new_date")
    private LocalDate newDate;

    @Column(name = "new_time")
    private LocalTime newTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id")
    private UserAccount changedBy;

    @Column(length = 1000)
    private String reason;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    protected AppointmentStatusHistory() {
    }

    public AppointmentStatusHistory(
            Appointment appointment,
            AppointmentStatus previousStatus,
            AppointmentStatus newStatus,
            LocalDate previousDate,
            LocalTime previousTime,
            LocalDate newDate,
            LocalTime newTime,
            UserAccount changedBy,
            String reason) {
        this.appointment = appointment;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.previousDate = previousDate;
        this.previousTime = previousTime;
        this.newDate = newDate;
        this.newTime = newTime;
        this.changedBy = changedBy;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public AppointmentStatus getPreviousStatus() {
        return previousStatus;
    }

    public AppointmentStatus getNewStatus() {
        return newStatus;
    }

    public LocalDate getPreviousDate() {
        return previousDate;
    }

    public LocalTime getPreviousTime() {
        return previousTime;
    }

    public LocalDate getNewDate() {
        return newDate;
    }

    public LocalTime getNewTime() {
        return newTime;
    }

    public UserAccount getChangedBy() {
        return changedBy;
    }

    public String getReason() {
        return reason;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }
}
