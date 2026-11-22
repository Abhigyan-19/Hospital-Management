package com.hospital.management.appointment.service;

import com.hospital.management.appointment.dto.AppointmentRequest;
import com.hospital.management.appointment.dto.AppointmentHistoryResponse;
import com.hospital.management.appointment.dto.AppointmentQueueEntryResponse;
import com.hospital.management.appointment.dto.AppointmentResponse;
import com.hospital.management.appointment.dto.RescheduleRequest;
import com.hospital.management.appointment.entity.Appointment;
import com.hospital.management.appointment.entity.AppointmentStatus;
import com.hospital.management.appointment.entity.AppointmentStatusHistory;
import com.hospital.management.appointment.repository.AppointmentRepository;
import com.hospital.management.appointment.repository.AppointmentStatusHistoryRepository;
import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.entity.DoctorAvailability;
import com.hospital.management.doctor.repository.DoctorAvailabilityRepository;
import com.hospital.management.doctor.repository.DoctorRepository;
import com.hospital.management.notification.service.NotificationService;
import com.hospital.management.patient.entity.Patient;
import com.hospital.management.patient.repository.PatientRepository;
import com.hospital.management.security.AuthenticatedUser;
import com.hospital.management.security.UserAccount;
import com.hospital.management.security.UserAccountRepository;
import com.hospital.management.security.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class AppointmentService {
    private static final Set<AppointmentStatus> ACTIVE_STATUSES = Set.of(
            AppointmentStatus.PENDING,
            AppointmentStatus.APPROVED,
            AppointmentStatus.SCHEDULED);

    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository historyRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final UserAccountRepository userAccountRepository;
    private final NotificationService notificationService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            AppointmentStatusHistoryRepository historyRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            DoctorAvailabilityRepository availabilityRepository,
            UserAccountRepository userAccountRepository,
            NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.historyRepository = historyRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.userAccountRepository = userAccountRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listForStaff(UserRole role) {
        requireStaff(role);
        return appointmentRepository.findAllByOrderByDateAscTimeAsc()
                .stream().map(appointment -> toResponse(appointment, role == UserRole.RECEPTIONIST)).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listMine(AuthenticatedUser user) {
        List<Appointment> appointments;
        if (user.role() == UserRole.PATIENT) {
            List<Long> patientIds = patientRepository.findByOwnerAccount_IdOrderByIdAsc(user.id())
                    .stream().map(Patient::getId).toList();
            appointments = patientIds.isEmpty()
                    ? List.of()
                    : appointmentRepository.findByPatient_IdInOrderByDateAscTimeAsc(patientIds);
        } else if (user.role() == UserRole.DOCTOR) {
            Doctor doctor = doctorRepository.findByAccount_Id(user.id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is not linked to a doctor profile."));
            appointments = appointmentRepository.findByDoctor_IdOrderByDateAscTimeAsc(doctor.getId());
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patients and doctors can retrieve personal appointments.");
        }
        return appointments.stream().map(appointment -> toResponse(appointment, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentQueueEntryResponse> getQueue(AuthenticatedUser user, Long requestedDoctorId) {
        Long doctorId;
        if (user.role() == UserRole.DOCTOR) {
            Doctor doctor = doctorRepository.findByAccount_Id(user.id())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN, "This account is not linked to a doctor profile."));
            if (requestedDoctorId != null && !requestedDoctorId.equals(doctor.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctors can only view their own queue.");
            }
            doctorId = doctor.getId();
        } else {
            requireStaff(user.role());
            if (requestedDoctorId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "doctorId is required to retrieve a queue.");
            }
            if (!doctorRepository.existsById(requestedDoctorId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found.");
            }
            doctorId = requestedDoctorId;
        }

        List<Appointment> appointments = appointmentRepository
                .findByDoctor_IdAndDateAndCheckedInAtIsNotNullAndStatusInOrderByCheckedInAtAscIdAsc(
                        doctorId,
                        LocalDate.now(),
                        List.of(AppointmentStatus.APPROVED, AppointmentStatus.SCHEDULED));
        List<AppointmentQueueEntryResponse> queue = new ArrayList<>(appointments.size());
        for (int i = 0; i < appointments.size(); i++) {
            queue.add(new AppointmentQueueEntryResponse(i + 1, toResponse(appointments.get(i), true)));
        }
        return List.copyOf(queue);
    }

    @Transactional
    public AppointmentResponse createForPatient(AppointmentRequest request, AuthenticatedUser user) {
        Patient patient = patientRepository.findByIdAndOwnerAccount_Id(request.patientId(), user.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot book appointments for this patient profile."));
        return create(request, patient, AppointmentStatus.PENDING, account(user.id()));
    }

    @Transactional
    public AppointmentResponse createForStaff(AppointmentRequest request, AuthenticatedUser user) {
        requireStaff(user.role());
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found."));
        return create(request, patient, AppointmentStatus.SCHEDULED, account(user.id()));
    }

    @Transactional
    public AppointmentResponse approve(Long id, AuthenticatedUser actor) {
        if (actor.role() != UserRole.RECEPTIONIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only receptionists can approve appointment requests.");
        }
        Appointment appointment = getLocked(id);
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending appointment requests can be approved.");
        }
        updateStatus(appointment, AppointmentStatus.APPROVED, account(actor.id()), null);
        notificationService.appointmentApproved(appointment);
        return toResponse(appointment, true);
    }

    @Transactional
    public AppointmentResponse reject(Long id, String reason, AuthenticatedUser actor) {
        if (actor.role() != UserRole.RECEPTIONIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only receptionists can reject appointment requests.");
        }
        Appointment appointment = getLocked(id);
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending appointment requests can be rejected.");
        }
        appointment.setRejectionReason(trimToNull(reason));
        updateStatus(appointment, AppointmentStatus.REJECTED, account(actor.id()), reason);
        notificationService.appointmentRejected(appointment, reason);
        return toResponse(appointment, true);
    }

    @Transactional
    public AppointmentResponse cancelMine(Long id, AuthenticatedUser actor) {
        Appointment appointment = getLocked(id);
        if (appointment.getPatient().getOwnerAccount() == null
                || !appointment.getPatient().getOwnerAccount().getId().equals(actor.id())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found.");
        }
        ensureOpenAndFuture(appointment);
        updateStatus(appointment, AppointmentStatus.CANCELLED, account(actor.id()), null);
        notificationService.appointmentCancelled(appointment);
        return toResponse(appointment, false);
    }

    @Transactional
    public AppointmentResponse updateAdminStatus(Long id, String requestedStatus, AuthenticatedUser actor) {
        if (actor.role() != UserRole.ADMIN && actor.role() != UserRole.RECEPTIONIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only authorized staff can manage appointment status.");
        }
        AppointmentStatus target = switch (requestedStatus == null ? "" : requestedStatus.trim().toUpperCase(Locale.ROOT)) {
            case "COMPLETED" -> AppointmentStatus.COMPLETED;
            case "CANCELLED", "CANCELED" -> AppointmentStatus.CANCELLED;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Staff may only complete or cancel appointments here.");
        };
        Appointment appointment = getLocked(id);
        if (target == AppointmentStatus.COMPLETED) {
            if (appointment.getStatus() != AppointmentStatus.APPROVED && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Only approved or scheduled appointments can be completed.");
            }
            if (LocalDateTime.of(appointment.getDate(), appointment.getTime()).isAfter(LocalDateTime.now())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A future appointment cannot be completed.");
            }
        } else {
            ensureOpenAndFuture(appointment);
        }
        updateStatus(appointment, target, account(actor.id()), null);
        if (target == AppointmentStatus.CANCELLED) {
            notificationService.appointmentCancelled(appointment);
        } else {
            notificationService.appointmentCompleted(appointment);
        }
        return toResponse(appointment, actor.role() == UserRole.RECEPTIONIST);
    }

    @Transactional
    public AppointmentResponse checkIn(Long id, AuthenticatedUser actor) {
        if (actor.role() != UserRole.RECEPTIONIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only receptionists can check in appointments.");
        }
        Appointment appointment = getLocked(id);
        if (!appointment.getDate().equals(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only appointments scheduled for today can be checked in.");
        }
        if (appointment.getStatus() != AppointmentStatus.APPROVED
                && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only approved or scheduled appointments can be checked in.");
        }
        if (appointment.getCheckedInAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment has already been checked in.");
        }
        appointment.setCheckedInAt(LocalDateTime.now());
        return toResponse(appointmentRepository.save(appointment), true);
    }

    @Transactional
    public AppointmentResponse rescheduleMine(Long id, RescheduleRequest request, AuthenticatedUser actor) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found."));
        if (appointment.getPatient().getOwnerAccount() == null
                || !appointment.getPatient().getOwnerAccount().getId().equals(actor.id())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found.");
        }
        return reschedule(appointment, request, account(actor.id()), "Rescheduled by patient", false);
    }

    @Transactional
    public AppointmentResponse rescheduleForStaff(Long id, RescheduleRequest request, AuthenticatedUser actor) {
        if (actor.role() != UserRole.RECEPTIONIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only receptionists can reschedule appointments for patients.");
        }
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found."));
        return reschedule(appointment, request, account(actor.id()), "Rescheduled by receptionist", true);
    }

    @Transactional(readOnly = true)
    public List<AppointmentHistoryResponse> history(Long id, AuthenticatedUser user) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found."));
        boolean allowed = switch (user.role()) {
            case ADMIN, RECEPTIONIST -> true;
            case PATIENT -> appointment.getPatient().getOwnerAccount() != null
                    && appointment.getPatient().getOwnerAccount().getId().equals(user.id());
            case DOCTOR -> appointment.getDoctor().getAccount() != null
                    && appointment.getDoctor().getAccount().getId().equals(user.id());
        };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found.");
        }
        return historyRepository.findByAppointment_IdOrderByChangedAtAsc(id)
                .stream().map(AppointmentHistoryResponse::from).toList();
    }

    private AppointmentResponse create(
            AppointmentRequest request,
            Patient patient,
            AppointmentStatus status,
            UserAccount creator) {
        validateFuture(request.date(), request.time());
        Doctor doctor = doctorRepository.findByIdForUpdate(request.doctorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found."));
        if (!"APPROVED".equals(doctor.getApprovalStatus()) || doctor.getAccount() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The selected doctor is not available for booking.");
        }
        DoctorAvailability availability = getAvailability(doctor.getId());
        validateAvailableSlot(availability, request.date(), request.time());
        rejectOverlap(doctor, request.date(), request.time(), availability.getSlotMinutes(), null);

        Appointment appointment = appointmentRepository.save(new Appointment(
                patient,
                doctor,
                request.date(),
                request.time(),
                status,
                availability.getSlotMinutes(),
                creator,
                trimToNull(request.reason())));
        recordHistory(appointment, null, status, null, null, request.date(), request.time(), creator,
                "Appointment requested");
        return toResponse(appointment, false);
    }

    private AppointmentResponse reschedule(
            Appointment appointment,
            RescheduleRequest request,
            UserAccount actor,
            String reason,
            boolean receptionistResponse) {
        appointment = appointmentRepository.findByIdForUpdate(appointment.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found."));
        ensureOpenAndFuture(appointment);
        if (!ACTIVE_STATUSES.contains(appointment.getStatus()) || appointment.getCheckedInAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only open, not-yet-checked-in appointments can be rescheduled.");
        }
        validateFuture(request.date(), request.time());
        Doctor doctor = doctorRepository.findByIdForUpdate(appointment.getDoctor().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found."));
        DoctorAvailability availability = getAvailability(doctor.getId());
        validateAvailableSlot(availability, request.date(), request.time());
        rejectOverlap(doctor, request.date(), request.time(), availability.getSlotMinutes(), appointment.getId());

        LocalDate oldDate = appointment.getDate();
        LocalTime oldTime = appointment.getTime();
        AppointmentStatus status = appointment.getStatus();
        appointment.setDate(request.date());
        appointment.setTime(request.time());
        appointment.setDurationMinutes(availability.getSlotMinutes());
        appointmentRepository.save(appointment);
        AppointmentStatusHistory history = historyRepository.save(new AppointmentStatusHistory(
                appointment, status, status, oldDate, oldTime, request.date(), request.time(), actor, reason));
        notificationService.appointmentRescheduled(appointment, history.getId());
        return toResponse(appointment, receptionistResponse);
    }

    private void updateStatus(
            Appointment appointment,
            AppointmentStatus target,
            UserAccount actor,
            String reason) {
        AppointmentStatus previous = appointment.getStatus();
        appointment.setStatus(target);
        appointmentRepository.save(appointment);
        recordHistory(appointment, previous, target, appointment.getDate(), appointment.getTime(),
                appointment.getDate(), appointment.getTime(), actor, trimToNull(reason));
    }

    private void recordHistory(
            Appointment appointment,
            AppointmentStatus previousStatus,
            AppointmentStatus newStatus,
            LocalDate previousDate,
            LocalTime previousTime,
            LocalDate newDate,
            LocalTime newTime,
            UserAccount actor,
            String reason) {
        historyRepository.save(new AppointmentStatusHistory(
                appointment, previousStatus, newStatus, previousDate, previousTime, newDate, newTime, actor, reason));
    }

    private void rejectOverlap(Doctor doctor, LocalDate date, LocalTime time, int durationMinutes, Long excludedId) {
        LocalDateTime start = LocalDateTime.of(date, time);
        LocalDateTime end = start.plusMinutes(durationMinutes);
        boolean overlaps = appointmentRepository.findByDoctor_IdAndDate(doctor.getId(), date).stream()
                .filter(existing -> !existing.getId().equals(excludedId))
                .filter(existing -> ACTIVE_STATUSES.contains(existing.getStatus()))
                .anyMatch(existing -> {
                    LocalDateTime existingStart = LocalDateTime.of(existing.getDate(), existing.getTime());
                    LocalDateTime existingEnd = existingStart.plusMinutes(existing.getDurationMinutes());
                    return start.isBefore(existingEnd) && existingStart.isBefore(end);
                });
        if (overlaps) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That doctor has an overlapping appointment. Choose another slot.");
        }
    }

    private void validateAvailableSlot(DoctorAvailability availability, LocalDate date, LocalTime time) {
        String day = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        if (!availability.getWorkingDays().contains(day) || availability.getLeaveDates().contains(date.toString())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The doctor is not available on the selected date.");
        }
        long offset = Duration.between(availability.getStartTime(), time).toMinutes();
        if (offset < 0 || offset % availability.getSlotMinutes() != 0
                || time.plusMinutes(availability.getSlotMinutes()).isAfter(availability.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Choose a valid slot within the doctor's configured availability.");
        }
    }

    private DoctorAvailability getAvailability(Long doctorId) {
        return availabilityRepository.findByDoctor_Id(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "The doctor must configure availability before appointments can be booked."));
    }

    private void validateFuture(LocalDate date, LocalTime time) {
        if (time.getSecond() != 0 || time.getNano() != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment times must use whole minutes.");
        }
        if (!LocalDateTime.of(date, time).isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a future appointment date and time.");
        }
    }

    private void ensureOpenAndFuture(Appointment appointment) {
        if (!ACTIVE_STATUSES.contains(appointment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment can no longer be changed.");
        }
        validateFuture(appointment.getDate(), appointment.getTime());
    }

    private Appointment getLocked(Long id) {
        return appointmentRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found."));
    }

    private UserAccount account(Long id) {
        return userAccountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account is no longer available."));
    }

    private void requireStaff(UserRole role) {
        if (role != UserRole.ADMIN && role != UserRole.RECEPTIONIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This operation is available to authorized staff only.");
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AppointmentResponse toResponse(Appointment appointment, boolean includeCheckInStatus) {
        Doctor doctor = appointment.getDoctor();
        DoctorAvailability availability = availabilityRepository.findByDoctor_Id(doctor.getId()).orElse(null);
        String status = includeCheckInStatus
                && appointment.getCheckedInAt() != null
                && ACTIVE_STATUSES.contains(appointment.getStatus())
                ? "Checked In"
                : switch (appointment.getStatus()) {
                    case PENDING -> "Pending";
                    case APPROVED -> "Confirmed";
                    case REJECTED -> "Rejected";
                    case SCHEDULED -> "Scheduled";
                    case CANCELLED -> "Cancelled";
                    case COMPLETED -> "Completed";
                };
        return new AppointmentResponse(
                appointment.getId(),
                new AppointmentResponse.PatientSummary(appointment.getPatient().getId(), appointment.getPatient().getName()),
                new AppointmentResponse.DoctorSummary(
                        doctor.getId(),
                        doctor.getName(),
                        doctor.getSpecialization(),
                        availability != null,
                        availability == null ? null : availability.getStartTime().toString(),
                        availability == null ? null : availability.getEndTime().toString(),
                        availability == null ? 0 : availability.getSlotMinutes(),
                        availability == null ? List.of() : availability.getWorkingDays(),
                        availability == null ? List.of() : availability.getLeaveDates()),
                appointment.getDate().toString(),
                appointment.getTime().toString(),
                status,
                appointment.getDurationMinutes(),
                appointment.getCheckedInAt(),
                appointment.getReason());
    }
}
