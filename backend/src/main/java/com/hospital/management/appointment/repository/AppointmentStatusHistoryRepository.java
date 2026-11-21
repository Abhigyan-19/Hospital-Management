package com.hospital.management.appointment.repository;

import com.hospital.management.appointment.entity.AppointmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentStatusHistoryRepository extends JpaRepository<AppointmentStatusHistory, Long> {
    List<AppointmentStatusHistory> findByAppointment_IdOrderByChangedAtAsc(Long appointmentId);
}
