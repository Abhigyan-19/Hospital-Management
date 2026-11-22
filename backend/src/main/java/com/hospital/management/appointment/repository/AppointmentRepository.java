package com.hospital.management.appointment.repository;

import com.hospital.management.appointment.entity.Appointment;
import com.hospital.management.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select appointment from Appointment appointment where appointment.id = :id")
    Optional<Appointment> findByIdForUpdate(@Param("id") Long id);

    List<Appointment> findByDoctor_IdAndDate(Long doctorId, LocalDate date);

    List<Appointment> findByPatient_IdInOrderByDateAscTimeAsc(List<Long> patientIds);

    List<Appointment> findByDoctor_IdOrderByDateAscTimeAsc(Long doctorId);

    List<Appointment> findByDoctor_IdAndDateAndCheckedInAtIsNotNullAndStatusInOrderByCheckedInAtAscIdAsc(
            Long doctorId,
            LocalDate date,
            Collection<AppointmentStatus> statuses);

    List<Appointment> findAllByOrderByDateAscTimeAsc();

    boolean existsByPatient_IdAndDoctor_IdAndStatus(
            Long patientId,
            Long doctorId,
            com.hospital.management.appointment.entity.AppointmentStatus status);

    java.util.Optional<Appointment> findByPatient_IdAndDoctor_IdAndStatus(
            Long patientId,
            Long doctorId,
            com.hospital.management.appointment.entity.AppointmentStatus status);

    boolean existsByDoctor_Id(Long doctorId);

    boolean existsByPatient_Id(Long patientId);
}