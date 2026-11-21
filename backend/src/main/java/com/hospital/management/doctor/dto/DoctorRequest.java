package com.hospital.management.doctor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DoctorRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 200) String specialization,
        @NotNull @Min(0) Integer experience) {
}
