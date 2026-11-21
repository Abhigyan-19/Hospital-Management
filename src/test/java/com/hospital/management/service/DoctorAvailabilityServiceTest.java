package com.hospital.management.service;

import com.hospital.management.dto.DoctorAvailabilityDto;
import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.DoctorAvailability;
import com.hospital.management.repository.DoctorAvailabilityRepository;
import com.hospital.management.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DoctorAvailabilityServiceTest {

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;
    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorAvailabilityService doctorAvailabilityService;

    private Doctor doctor;
    private DoctorAvailability availability;

    @BeforeEach
    void setUp() {
        doctor = new Doctor("Dr. Anika Sharma", "Cardiology", 10);
        doctor.setId(2L);

        availability = new DoctorAvailability(
                doctor,
                "Monday,Tuesday,Wednesday,Thursday,Friday",
                "09:00",
                "17:00",
                30,
                "2026-11-27"
        );
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when doctor is on scheduled leave")
    void validateDoctorAvailable_OnLeave_ThrowsException() {
        when(availabilityRepository.findByDoctor_Id(2L)).thenReturn(Optional.of(availability));

        assertThatThrownBy(() -> doctorAvailabilityService.validateDoctorAvailable(2L, "2026-11-27", "10:00"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Doctor is on scheduled leave");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when day is not a scheduled working day")
    void validateDoctorAvailable_NonWorkingDay_ThrowsException() {
        when(availabilityRepository.findByDoctor_Id(2L)).thenReturn(Optional.of(availability));

        // 2026-11-29 is a Sunday
        assertThatThrownBy(() -> doctorAvailabilityService.validateDoctorAvailable(2L, "2026-11-29", "10:00"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Doctor is not scheduled to consult on Sundays");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when time is outside consultation hours")
    void validateDoctorAvailable_OutsideHours_ThrowsException() {
        when(availabilityRepository.findByDoctor_Id(2L)).thenReturn(Optional.of(availability));

        // 2026-11-25 is Wednesday (working day), but 08:00 is before 09:00
        assertThatThrownBy(() -> doctorAvailabilityService.validateDoctorAvailable(2L, "2026-11-25", "08:00"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("earlier than doctor's start time");
    }

    @Test
    @DisplayName("Should pass validation when doctor is available within hours")
    void validateDoctorAvailable_ValidSlot_Passes() {
        when(availabilityRepository.findByDoctor_Id(2L)).thenReturn(Optional.of(availability));

        // 2026-11-25 is Wednesday, 10:00 is between 09:00 and 17:00
        doctorAvailabilityService.validateDoctorAvailable(2L, "2026-11-25", "10:00");
    }
}
