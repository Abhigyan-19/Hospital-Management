package com.hospital.management.service;

import com.hospital.management.dto.AppointmentRequest;
import com.hospital.management.entity.Appointment;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.Role;
import com.hospital.management.entity.User;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private SmsService smsService;
    @Mock
    private DoctorAvailabilityService doctorAvailabilityService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Patient patient;
    private Doctor doctor;
    private CustomUserDetails patientUserDetails;

    @BeforeEach
    void setUp() {
        patient = new Patient("Maya Iyer", 28, "Female", "+91 9876543210");
        patient.setId(1L);

        doctor = new Doctor("Dr. Anika Sharma", "Cardiology", 10);
        doctor.setId(2L);

        User user = new User("patient@sebasethu.health", "hash", "Maya Iyer", Role.PATIENT);
        user.setId(10L);
        user.setPatientId(1L);
        patientUserDetails = new CustomUserDetails(user);
    }

    @Test
    @DisplayName("Should successfully book appointment and dispatch non-blocking SMS")
    void createAppointment_Success() {
        AppointmentRequest request = new AppointmentRequest(1L, 2L, "2026-11-25", "10:00");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusNot(2L, "2026-11-25", "10:00", "Cancelled"))
                .thenReturn(false);

        Appointment savedAppointment = new Appointment(patient, doctor, "2026-11-25", "10:00", "Scheduled");
        savedAppointment.setId(100L);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        Appointment result = appointmentService.createAppointment(request, patientUserDetails);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo("Scheduled");

        verify(doctorAvailabilityService).validateDoctorAvailable(2L, "2026-11-25", "10:00");
        verify(smsService).sendAppointmentBookingSms(eq(patient), eq(doctor), eq("2026-11-25"), eq("10:00"));
    }

    @Test
    @DisplayName("Should prevent double-booking for same doctor, date, and time slot")
    void createAppointment_DoubleBooking_ThrowsException() {
        AppointmentRequest request = new AppointmentRequest(1L, 2L, "2026-11-25", "10:00");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusNot(2L, "2026-11-25", "10:00", "Cancelled"))
                .thenReturn(true);

        assertThatThrownBy(() -> appointmentService.createAppointment(request, patientUserDetails))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Doctor is already booked for this time slot");

        verify(appointmentRepository, never()).save(any());
        verify(smsService, never()).sendAppointmentBookingSms(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should prevent patient from booking an appointment under another patient's ID")
    void createAppointment_AccessDenied_WhenPatientIdMismatch() {
        AppointmentRequest request = new AppointmentRequest(999L, 2L, "2026-11-25", "10:00");

        assertThatThrownBy(() -> appointmentService.createAppointment(request, patientUserDetails))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Patients can only schedule appointments for themselves");
    }

    @Test
    @DisplayName("Should reschedule appointment and dispatch reschedule SMS")
    void rescheduleAppointment_Success() {
        Appointment appointment = new Appointment(patient, doctor, "2026-11-25", "10:00", "Scheduled");
        appointment.setId(100L);

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusNotAndIdNot(2L, "2026-11-26", "14:15", "Cancelled", 100L))
                .thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment rescheduled = appointmentService.rescheduleAppointment(100L, "2026-11-26", "14:15", patientUserDetails);

        assertThat(rescheduled.getDate()).isEqualTo("2026-11-26");
        assertThat(rescheduled.getTime()).isEqualTo("14:15");

        verify(smsService).sendAppointmentRescheduledSms(patient, doctor, "2026-11-25", "2026-11-26", "14:15");
    }

    @Test
    @DisplayName("Should update status to Cancelled and dispatch cancellation SMS")
    void updateStatus_Cancelled_DispatchesSms() {
        Appointment appointment = new Appointment(patient, doctor, "2026-11-25", "10:00", "Scheduled");
        appointment.setId(100L);

        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment updated = appointmentService.updateStatus(100L, "Cancelled", patientUserDetails);

        assertThat(updated.getStatus()).isEqualTo("Cancelled");
        verify(smsService).sendAppointmentCancelledSms(patient, doctor, "2026-11-25", "10:00");
    }
}
