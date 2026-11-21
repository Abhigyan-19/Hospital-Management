package com.hospital.management.security.dto;

public record AuthResponse(String token, UserResponse user) {
    public record UserResponse(
            Long id,
            String email,
            String name,
            String role,
            Long patientId,
            Long doctorId,
            String approvalStatus) {
    }
}
