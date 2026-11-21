package com.hospital.management.security.dto;

import com.hospital.management.security.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotNull UserRole role) {
}
