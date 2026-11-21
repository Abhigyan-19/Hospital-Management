package com.hospital.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BedRequest(
        @NotBlank(message = "Bed number is required") String bedNumber,
        @NotNull(message = "Ward ID is required") Long wardId
) {
}
