package com.hospital.management.security.dto;

import com.hospital.management.security.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotNull UserRole role,
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(max = 50) String phone,
        @Min(0) Integer age,
        @Size(max = 100) String gender,
        String patientRelationship,
        @Size(max = 100) String relationship,
        @Size(max = 200) String patientName,
        @Size(max = 200) String specialization,
        @Min(0) Integer experience) {
}
