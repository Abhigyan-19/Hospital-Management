package com.hospital.management.repository;

import com.hospital.management.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDoctorIdAndDateAndTimeAndStatusNot(
            Long doctorId,
            String date,
            String time,
            String status
    );

    Optional<Appointment> findByPatient_IdAndDoctor_IdAndStatus(
            Long patientId,
            Long doctorId,
            String status
    );

    List<Appointment> findByPatient_Id(Long patientId);

    List<Appointment> findByDoctor_Id(Long doctorId);
}
