package com.hospital.management.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DoctorReviewRequest(
        @NotBlank @Pattern(regexp = "APPROVED|REJECTED") String approvalStatus) {
}
