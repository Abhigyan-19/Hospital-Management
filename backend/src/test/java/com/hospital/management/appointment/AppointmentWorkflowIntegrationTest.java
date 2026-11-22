package com.hospital.management.appointment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.management.appointment.entity.Appointment;
import com.hospital.management.appointment.entity.AppointmentStatus;
import com.hospital.management.appointment.repository.AppointmentRepository;
import com.hospital.management.appointment.repository.AppointmentStatusHistoryRepository;
import com.hospital.management.appointment.service.AppointmentService;
import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.entity.DoctorAvailability;
import com.hospital.management.doctor.repository.DoctorAvailabilityRepository;
import com.hospital.management.doctor.repository.DoctorRepository;
import com.hospital.management.notification.repository.NotificationRepository;
import com.hospital.management.patient.entity.Patient;
import com.hospital.management.patient.repository.PatientRepository;
import com.hospital.management.security.JwtService;
import com.hospital.management.security.AuthenticatedUser;
import com.hospital.management.security.UserAccount;
import com.hospital.management.security.UserAccountRepository;
import com.hospital.management.security.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:appointment-workflow-tests;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
@AutoConfigureMockMvc
class AppointmentWorkflowIntegrationTest {
    private static final String[] WORKING_DAYS = {
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    };

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtService jwtService;
    @Autowired private UserAccountRepository userAccountRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private DoctorAvailabilityRepository availabilityRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private AppointmentStatusHistoryRepository historyRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private AppointmentService appointmentService;

    private UserAccount admin;
    private UserAccount receptionist;
    private UserAccount patientAccount;
    private UserAccount doctorAccount;
    private Patient patient;
    private Doctor doctor;
    private LocalDate appointmentDate;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        historyRepository.deleteAll();
        appointmentRepository.deleteAll();
        availabilityRepository.deleteAll();
        patientRepository.deleteAll();
        doctorRepository.deleteAll();
        userAccountRepository.deleteAll();

        admin = saveAccount("admin@example.test", UserRole.ADMIN);
        receptionist = saveAccount("reception@example.test", UserRole.RECEPTIONIST);
        patientAccount = saveAccount("patient@example.test", UserRole.PATIENT);
        doctorAccount = saveAccount("doctor@example.test", UserRole.DOCTOR);

        patient = new Patient("Patient One", 40, "Female", "555-0101");
        patient.setOwnerAccount(patientAccount);
        patient.setRelationshipToAccount("SELF");
        patient = patientRepository.saveAndFlush(patient);

        doctor = new Doctor("Dr. One", "Cardiology", 10);
        doctor.setAccount(doctorAccount);
        doctor.setApprovalStatus("APPROVED");
        doctor = doctorRepository.saveAndFlush(doctor);
        availabilityRepository.saveAndFlush(new DoctorAvailability(
                doctor,
                List.of(WORKING_DAYS),
                LocalTime.of(9, 0),
                LocalTime.of(17, 0),
                30,
                List.of()));
        appointmentDate = LocalDate.now().plusDays(7);
    }

    @Test
    void approvalNotifiesPatientDoctorAndAdminAndPreventsRepeatedProcessing() throws Exception {
        long appointmentId = createPatientRequest(appointmentDate, LocalTime.of(10, 0));

        mockMvc.perform(post("/reception/appointments/{id}/approve", appointmentId)
                        .header("Authorization", bearer(receptionist)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Confirmed")));

        assertEquals(1, notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(patientAccount.getId()).size());
        assertEquals(1, notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(doctorAccount.getId()).size());
        assertEquals(1, notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(admin.getId()).size());
        assertEquals(2, historyRepository.findByAppointment_IdOrderByChangedAtAsc(appointmentId).size());

        mockMvc.perform(post("/reception/appointments/{id}/approve", appointmentId)
                        .header("Authorization", bearer(receptionist)))
                .andExpect(status().isConflict());
    }

    @Test
    void rejectionNotifiesPatientAndAdminButNotDoctorAndStoresReason() throws Exception {
        long appointmentId = createPatientRequest(appointmentDate, LocalTime.of(11, 0));

        mockMvc.perform(post("/reception/appointments/{id}/reject", appointmentId)
                        .header("Authorization", bearer(receptionist))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Doctor unavailable\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Rejected")));

        assertTrue(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(patientAccount.getId()).get(0)
                .getMessage().contains("Doctor unavailable"));
        assertTrue(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(doctorAccount.getId()).isEmpty());
        assertEquals(1, notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(admin.getId()).size());
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow();
        assertEquals(AppointmentStatus.REJECTED, appointment.getStatus());
        assertEquals("Doctor unavailable", appointment.getRejectionReason());
    }

    @Test
    void bookingEnforcesLinkedPatientOwnershipAndOverlappingDuration() throws Exception {
        createPatientRequest(appointmentDate, LocalTime.of(10, 0));

        UserAccount otherPatient = saveAccount("other@example.test", UserRole.PATIENT);
        String request = """
                {"patientId":%d,"doctorId":%d,"date":"%s","time":"10:15"}
                """.formatted(patient.getId(), doctor.getId(), appointmentDate);
        mockMvc.perform(post("/appointments/me")
                        .header("Authorization", bearer(otherPatient))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isForbidden());

        availabilityRepository.findByDoctor_Id(doctor.getId()).orElseThrow()
                .update(List.of(WORKING_DAYS), LocalTime.of(9, 0), LocalTime.of(17, 0), 15, List.of());
        availabilityRepository.flush();
        createRequestAtTime(patientAccount, appointmentDate, LocalTime.of(10, 15))
                .andExpect(status().isConflict());
    }

    @Test
    void notificationAccessAndUnreadStateAreRecipientScoped() throws Exception {
        long appointmentId = createPatientRequest(appointmentDate, LocalTime.of(12, 0));
        mockMvc.perform(post("/reception/appointments/{id}/approve", appointmentId)
                        .header("Authorization", bearer(receptionist)))
                .andExpect(status().isOk());

        Long notificationId = notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(patientAccount.getId())
                .get(0).getId();
        mockMvc.perform(get("/notifications/me/unread-count")
                        .header("Authorization", bearer(patientAccount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(1)));
        mockMvc.perform(patch("/notifications/me/{id}/read", notificationId)
                        .header("Authorization", bearer(doctorAccount)))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/notifications/me/{id}/read", notificationId)
                        .header("Authorization", bearer(patientAccount)))
                        .andExpect(status().isOk())
                .andExpect(jsonPath("$.read", is(true)));
        mockMvc.perform(get("/notifications/me/unread-count")
                        .header("Authorization", bearer(patientAccount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(0)));
    }

    @Test
    void patientsCannotApproveAppointmentRequests() throws Exception {
        long appointmentId = createPatientRequest(appointmentDate, LocalTime.of(13, 0));
        mockMvc.perform(post("/reception/appointments/{id}/approve", appointmentId)
                        .header("Authorization", bearer(patientAccount)))
                .andExpect(status().isForbidden());
        assertEquals(AppointmentStatus.PENDING, appointmentRepository.findById(appointmentId).orElseThrow().getStatus());
    }

    @Test
    void receptionistCheckInRegistersAppointmentInDoctorQueueByArrivalOrder() throws Exception {
        LocalDate today = LocalDate.now();
        Appointment waiting = appointmentRepository.saveAndFlush(new Appointment(
                patient, doctor, today, LocalTime.of(10, 0), AppointmentStatus.SCHEDULED, 30, receptionist, null));
        waiting.setCheckedInAt(java.time.LocalDateTime.now().minusMinutes(2));
        appointmentRepository.saveAndFlush(waiting);
        Appointment arriving = appointmentRepository.saveAndFlush(new Appointment(
                patient, doctor, today, LocalTime.of(10, 30), AppointmentStatus.SCHEDULED, 30, receptionist, null));
        Appointment notCheckedIn = appointmentRepository.saveAndFlush(new Appointment(
                patient, doctor, today, LocalTime.of(11, 0), AppointmentStatus.SCHEDULED, 30, receptionist, null));

        mockMvc.perform(post("/reception/appointments/{id}/check-in", arriving.getId())
                        .header("Authorization", bearer(receptionist)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Checked In")));

        mockMvc.perform(get("/appointments/queue")
                        .header("Authorization", bearer(doctorAccount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].position", is(1)))
                .andExpect(jsonPath("$[0].appointment.id", is(waiting.getId().intValue())))
                .andExpect(jsonPath("$[1].position", is(2)))
                .andExpect(jsonPath("$[1].appointment.id", is(arriving.getId().intValue())));

        mockMvc.perform(get("/appointments/queue")
                        .param("doctorId", Long.toString(doctor.getId() + 1))
                        .header("Authorization", bearer(doctorAccount)))
                .andExpect(status().isForbidden());

        assertNull(appointmentRepository.findById(notCheckedIn.getId()).orElseThrow().getCheckedInAt());
    }

    @Test
    void notificationFailureRollsBackAppointmentApproval() throws Exception {
        long appointmentId = createPatientRequest(appointmentDate, LocalTime.of(14, 0));
        userAccountRepository.delete(admin);
        userAccountRepository.flush();

        assertThrows(IllegalStateException.class, () -> appointmentService.approve(
                appointmentId,
                new AuthenticatedUser(receptionist.getId(), receptionist.getEmail(), UserRole.RECEPTIONIST)));

        assertEquals(AppointmentStatus.PENDING,
                appointmentRepository.findById(appointmentId).orElseThrow().getStatus());
        assertTrue(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(patientAccount.getId()).isEmpty());
        assertTrue(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(doctorAccount.getId()).isEmpty());
    }

    private long createPatientRequest(LocalDate date, LocalTime time) throws Exception {
        String request = """
                {"patientId":%d,"doctorId":%d,"date":"%s","time":"%s"}
                """.formatted(patient.getId(), doctor.getId(), date, time);
        String response = mockMvc.perform(post("/appointments/me")
                        .header("Authorization", bearer(patientAccount))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Pending")))
                .andReturn().getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        return node.get("id").asLong();
    }

    private org.springframework.test.web.servlet.ResultActions createRequestAtTime(
            UserAccount account,
            LocalDate date,
            LocalTime time) throws Exception {
        String request = """
                {"patientId":%d,"doctorId":%d,"date":"%s","time":"%s"}
                """.formatted(patient.getId(), doctor.getId(), date, time);
        return mockMvc.perform(post("/appointments/me")
                .header("Authorization", bearer(account))
                .contentType(MediaType.APPLICATION_JSON)
                .content(request));
    }

    private UserAccount saveAccount(String email, UserRole role) {
        return userAccountRepository.saveAndFlush(
                new UserAccount(email, "test-password-hash", email, null, role));
    }

    private String bearer(UserAccount user) {
        return "Bearer " + jwtService.issue(user);
    }
}
