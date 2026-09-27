package com.hospital.management.repository;

import com.hospital.management.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDoctorIdAndDateAndTimeAndStatusNot(
            Long doctorId,
            String date,
            String time,
            String status
    );
}