package com.hospital.management.admin.dto;

import com.hospital.management.security.UserAccount;

public record UserResponse(Long id, String name, String email, String role, boolean active) {
    public static UserResponse from(UserAccount account) {
        return new UserResponse(account.getId(), account.getName(), account.getEmail(),
                account.getRole().name(), account.isActive());
    }
}
