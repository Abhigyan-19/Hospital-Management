package com.hospital.management.security;

public record AuthenticatedUser(Long id, String email, UserRole role) {
}
