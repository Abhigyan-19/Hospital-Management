package com.hospital.management.dto;

import jakarta.validation.constraints.NotBlank;

public record WardRequest(
        @NotBlank(message = "Ward name is required") String name,
        @NotBlank(message = "Department is required") String department,
        int floor
) {
}
