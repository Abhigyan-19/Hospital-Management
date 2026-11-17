package com.hospital.management.bed.dto;

import com.hospital.management.bed.entity.BedStatus;

public record BedResponse(
        Long id,
        String bedNumber,
        BedStatus status,
        Long wardId,
        String wardName,
        Long patientId,
        String patientName) {
}