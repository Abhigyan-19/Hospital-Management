package com.hospital.management.repository;

import com.hospital.management.entity.PatientVisitHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientVisitHistoryRepository extends JpaRepository<PatientVisitHistory, Long> {

    List<PatientVisitHistory> findByPatientIdOrderByCompletedAtDesc(Long patientId);

    List<PatientVisitHistory> findByPatientNameContainingIgnoreCaseOrPatientPhoneContainingOrderByCompletedAtDesc(String name, String phone);

    Optional<PatientVisitHistory> findByAppointmentId(Long appointmentId);

    List<PatientVisitHistory> findByDoctorIdOrderByCompletedAtDesc(Long doctorId);
}
