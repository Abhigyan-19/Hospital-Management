package com.hospital.management.admin.dto;

import com.hospital.management.security.UserRole;
import jakarta.validation.constraints.NotNull;

public record UserRoleRequest(@NotNull UserRole role) {
}
