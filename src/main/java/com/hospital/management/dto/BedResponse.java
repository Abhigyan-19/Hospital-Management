package com.hospital.management.dto;

import com.hospital.management.entity.BedStatus;

public record BedResponse(
        Long id,
        String bedNumber,
        BedStatus status,
        Long wardId,
        String wardName,
        Long patientId,
        String patientName) {
}