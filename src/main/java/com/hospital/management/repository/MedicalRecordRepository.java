package com.hospital.management.repository;

import com.hospital.management.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatient_IdOrderByCreatedAtDesc(Long patientId);

    List<MedicalRecord> findByDoctor_IdOrderByCreatedAtDesc(Long doctorId);

    Optional<MedicalRecord> findByAppointment_Id(Long appointmentId);
}
