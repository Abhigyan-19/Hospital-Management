package com.hospital.management.service;

import com.hospital.management.dto.ConsultationRequest;
import com.hospital.management.dto.MedicalRecordResponse;
import com.hospital.management.dto.PrescriptionRequest;
import com.hospital.management.entity.*;
import com.hospital.management.repository.*;
import com.hospital.management.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private PrescriptionRepository prescriptionRepository;
    @Mock
    private SmsService smsService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private MedicalRecordService medicalRecordService;

    private Patient patient;
    private Doctor doctor;
    private Appointment appointment;
    private CustomUserDetails doctorUserDetails;
    private CustomUserDetails patientUserDetails;

    @BeforeEach
    void setUp() {
        patient = new Patient("Maya Iyer", 28, "Female", "+91 9876543210");
        patient.setId(1L);

        doctor = new Doctor("Dr. Anika Sharma", "Cardiology", 10);
        doctor.setId(2L);

        appointment = new Appointment(patient, doctor, "2026-11-25", "10:00", "Scheduled");
        appointment.setId(100L);

        User doctorUser = new User("doctor@sebasethu.health", "hash", "Dr. Anika", Role.DOCTOR);
        doctorUser.setDoctorId(2L);
        doctorUserDetails = new CustomUserDetails(doctorUser);

        User patientUser = new User("patient@sebasethu.health", "hash", "Maya Iyer", Role.PATIENT);
        patientUser.setPatientId(1L);
        patientUserDetails = new CustomUserDetails(patientUser);
    }

    @Test
    @DisplayName("Should record consultation, issue prescription, mark appointment completed, and dispatch SMS")
    void recordConsultation_Success() {
        ConsultationRequest request = new ConsultationRequest();
        request.setDiagnosis("Hypertension Stage 1");
        request.setNotes("Lifestyle advice and daily blood pressure monitoring.");
        request.setCreatePrescription(true);
        request.setPrescriptionNotes("Take after breakfast");

        PrescriptionRequest.MedicineRequest med = new PrescriptionRequest.MedicineRequest();
        med.setName("Amlodipine 5mg");
        med.setDosage("1 tablet");
        med.setFrequency("Once daily");
        med.setDuration("30 days");
        med.setPatientInstructions("Take one tablet daily morning");
        request.setMedicines(List.of(med));

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenAnswer(invocation -> {
            MedicalRecord mr = invocation.getArgument(0);
            mr.setId(500L);
            return mr;
        });
        when(prescriptionRepository.save(any(Prescription.class))).thenAnswer(invocation -> {
            Prescription p = invocation.getArgument(0);
            p.setId(600L);
            return p;
        });
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MedicalRecordResponse response = medicalRecordService.recordConsultation(100L, request, doctorUserDetails);

        assertThat(response).isNotNull();
        assertThat(response.getDiagnosis()).isEqualTo("Hypertension Stage 1");
        assertThat(appointment.getStatus()).isEqualTo("Completed");

        verify(prescriptionRepository).save(any(Prescription.class));
        verify(smsService).sendPrescriptionSms(eq(patient), eq(doctor), anyList(), eq("Take after breakfast"));
        verify(smsService).sendAppointmentCompletedSms(eq(patient), eq(doctor), eq("2026-11-25"));
    }

    @Test
    @DisplayName("Should prevent doctor from recording consultation for an unassigned appointment")
    void recordConsultation_UnauthorizedDoctor_ThrowsException() {
        User otherDoctorUser = new User("other@sebasethu.health", "hash", "Dr. Other", Role.DOCTOR);
        otherDoctorUser.setDoctorId(999L);
        CustomUserDetails otherDoctor = new CustomUserDetails(otherDoctorUser);

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        ConsultationRequest request = new ConsultationRequest();
        request.setDiagnosis("Test");
        request.setNotes("Test");

        assertThatThrownBy(() -> medicalRecordService.recordConsultation(100L, request, otherDoctor))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Doctors can only conduct consultations for their own assigned appointments");
    }

    @Test
    @DisplayName("Should prevent patient from viewing another patient's medical records")
    void getRecordsByPatient_UnauthorizedPatient_ThrowsException() {
        assertThatThrownBy(() -> medicalRecordService.getRecordsByPatient(999L, patientUserDetails))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Patients can only view their own clinical records");
    }
}
