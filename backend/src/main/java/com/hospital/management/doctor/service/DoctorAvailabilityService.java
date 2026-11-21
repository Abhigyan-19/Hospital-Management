package com.hospital.management.doctor.service;

import com.hospital.management.appointment.entity.Appointment;
import com.hospital.management.appointment.entity.AppointmentStatus;
import com.hospital.management.appointment.repository.AppointmentRepository;
import com.hospital.management.doctor.dto.AvailabilityRequest;
import com.hospital.management.doctor.dto.AvailabilityResponse;
import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.entity.DoctorAvailability;
import com.hospital.management.doctor.repository.DoctorAvailabilityRepository;
import com.hospital.management.doctor.repository.DoctorRepository;
import com.hospital.management.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class DoctorAvailabilityService {
    private static final Set<String> WEEKDAYS = Set.of(
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
    private static final Set<Integer> SLOT_LENGTHS = Set.of(15, 20, 30, 45, 60);

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorAvailabilityService(
            DoctorRepository doctorRepository,
            DoctorAvailabilityRepository availabilityRepository,
            AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse getMine(AuthenticatedUser user) {
        Doctor doctor = getDoctor(user.id());
        return availabilityRepository.findByDoctor_Id(doctor.getId())
                .map(AvailabilityResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor availability has not been configured."));
    }

    @Transactional
    public AvailabilityResponse updateMine(AuthenticatedUser user, AvailabilityRequest request) {
        Doctor doctor = doctorRepository.findByAccount_Id(user.id())
                .map(existing -> doctorRepository.findByIdForUpdate(existing.getId()).orElseThrow())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is not linked to a doctor profile."));
        validate(request);
        DoctorAvailability availability = availabilityRepository.findByDoctor_Id(doctor.getId())
                .orElse(null);
        ensureExistingAppointmentsRemainValid(doctor.getId(), request);
        if (availability == null) {
            availability = new DoctorAvailability(
                    doctor, request.workingDays(), request.startTime(), request.endTime(),
                    request.slotMinutes(), request.leaveDates());
        } else {
            availability.update(request.workingDays(), request.startTime(), request.endTime(),
                    request.slotMinutes(), request.leaveDates());
        }
        return AvailabilityResponse.from(availabilityRepository.save(availability));
    }

    public Doctor getDoctor(Long accountId) {
        return doctorRepository.findByAccount_Id(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is not linked to a doctor profile."));
    }

    private void validate(AvailabilityRequest request) {
        if (!SLOT_LENGTHS.contains(request.slotMinutes())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot length must be 15, 20, 30, 45, or 60 minutes.");
        }
        if (!request.startTime().isBefore(request.endTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }
        if (request.workingDays().stream().anyMatch(day -> day == null || !WEEKDAYS.contains(day))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Availability contains an invalid weekday.");
        }
        if (request.leaveDates().stream().anyMatch(value -> value == null || !isDate(value))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Leave dates must use YYYY-MM-DD format.");
        }
    }

    private void ensureExistingAppointmentsRemainValid(Long doctorId, AvailabilityRequest request) {
        List<Appointment> appointments = appointmentRepository.findByDoctor_IdOrderByDateAscTimeAsc(doctorId);
        for (Appointment appointment : appointments) {
            if (!Set.of(AppointmentStatus.PENDING, AppointmentStatus.APPROVED, AppointmentStatus.SCHEDULED)
                    .contains(appointment.getStatus())) {
                continue;
            }
            String weekday = appointment.getDate().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            long offset = java.time.Duration.between(request.startTime(), appointment.getTime()).toMinutes();
            if (!request.workingDays().contains(weekday)
                    || request.leaveDates().contains(appointment.getDate().toString())
                    || offset < 0
                    || offset % request.slotMinutes() != 0
                    || appointment.getTime().plusMinutes(appointment.getDurationMinutes()).isAfter(request.endTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Availability cannot be changed while it would invalidate an existing appointment.");
            }
        }
    }

    private boolean isDate(String value) {
        try {
            LocalDate.parse(value);
            return true;
        } catch (java.time.format.DateTimeParseException exception) {
            return false;
        }
    }
}
