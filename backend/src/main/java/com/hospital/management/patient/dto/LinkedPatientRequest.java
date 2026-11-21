package com.hospital.management.patient.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LinkedPatientRequest(
        @NotBlank @Size(max = 200) String name,
        @NotNull @Min(0) Integer age,
        @NotBlank @Size(max = 100) String gender,
        @Size(max = 255) String phone,
        @NotBlank @Size(max = 100) String relationship) {
}
