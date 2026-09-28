package com.hospital.management.repository;

import com.hospital.management.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDoctorIdAndDateAndTimeAndStatusNot(
            Long doctorId,
            String date,
            String time,
            String status
    );

    // MAIN AUTHORIZATION QUERY
    Optional<Appointment> findByPatient_IdAndDoctor_IdAndStatus(
            Long patientId,
            Long doctorId,
            String status
    );

    // DIAGNOSTIC QUERIES
    Optional<Appointment> findByPatient_Id(Long patientId);

    Optional<Appointment> findByDoctor_Id(Long doctorId);
}