package com.hospital.management.service;

import com.hospital.management.dto.DoctorAvailabilityDto;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.DoctorAvailability;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.DoctorAvailabilityRepository;
import com.hospital.management.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class DoctorAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(DoctorAvailabilityService.class);

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    public DoctorAvailabilityDto getAvailability(Long doctorId) {
        return availabilityRepository.findByDoctor_Id(doctorId)
                .map(av -> new DoctorAvailabilityDto(
                        av.getWorkingDaysList(),
                        av.getStartTime(),
                        av.getEndTime(),
                        av.getSlotMinutes(),
                        av.getLeaveDatesList()
                ))
                .orElseGet(() -> new DoctorAvailabilityDto(
                        List.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"),
                        "09:00",
                        "17:00",
                        30,
                        List.of()
                ));
    }

    public DoctorAvailabilityDto updateAvailability(Long doctorId, DoctorAvailabilityDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        DoctorAvailability availability = availabilityRepository.findByDoctor_Id(doctorId)
                .orElseGet(() -> {
                    DoctorAvailability av = new DoctorAvailability();
                    av.setDoctor(doctor);
                    return av;
                });

        availability.setWorkingDaysList(dto.getWorkingDays());
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setSlotMinutes(dto.getSlotMinutes() > 0 ? dto.getSlotMinutes() : 30);
        availability.setLeaveDatesList(dto.getLeaveDates());

        DoctorAvailability saved = availabilityRepository.save(availability);

        return new DoctorAvailabilityDto(
                saved.getWorkingDaysList(),
                saved.getStartTime(),
                saved.getEndTime(),
                saved.getSlotMinutes(),
                saved.getLeaveDatesList()
        );
    }

    public void validateDoctorAvailable(Long doctorId, String date, String time) {
        if (doctorId == null || date == null || date.isBlank()) {
            return;
        }

        Optional<DoctorAvailability> optionalAv = availabilityRepository.findByDoctor_Id(doctorId);
        if (optionalAv.isEmpty()) {
            return; // If no custom availability record exists, default open schedule applies
        }

        DoctorAvailability av = optionalAv.get();

        // 1. Check leave dates
        List<String> leaves = av.getLeaveDatesList();
        if (leaves != null && leaves.contains(date.trim())) {
            throw new IllegalArgumentException("Doctor is on scheduled leave on " + date + ".");
        }

        // 2. Check day of week (separate date parsing from business validation)
        LocalDate appointmentDate = null;
        try {
            appointmentDate = LocalDate.parse(date.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            log.warn("Could not parse appointment date for availability validation: {}", date);
        }

        if (appointmentDate != null) {
            String dayOfWeek = appointmentDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            List<String> workingDays = av.getWorkingDaysList();
            if (workingDays != null && !workingDays.isEmpty() && !workingDays.contains(dayOfWeek)) {
                throw new IllegalArgumentException("Doctor is not scheduled to consult on " + dayOfWeek + "s.");
            }
        }

        // 3. Check consultation time bounds
        if (time != null && !time.isBlank()) {
            String requestedTime = time.trim();
            String start = av.getStartTime();
            String end = av.getEndTime();

            if (start != null && !start.isBlank() && requestedTime.compareTo(start.trim()) < 0) {
                throw new IllegalArgumentException("Requested time " + requestedTime + " is earlier than doctor's start time (" + start + ").");
            }
            if (end != null && !end.isBlank() && requestedTime.compareTo(end.trim()) >= 0) {
                throw new IllegalArgumentException("Requested time " + requestedTime + " is after doctor's consultation hours end (" + end + ").");
            }
        }
    }
}
