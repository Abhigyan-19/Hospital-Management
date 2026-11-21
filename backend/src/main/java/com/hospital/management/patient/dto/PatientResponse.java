package com.hospital.management.patient.dto;

import com.hospital.management.patient.entity.Patient;

public record PatientResponse(
        Long id,
        String name,
        int age,
        String gender,
        String phone,
        String relationshipToAccount,
        boolean isSelf,
        String relationship) {

    public static PatientResponse from(Patient patient) {
        String relationship = patient.getRelationshipToAccount();
        boolean isSelf = relationship == null || "SELF".equalsIgnoreCase(relationship);
        return new PatientResponse(
                patient.getId(),
                patient.getName(),
                patient.getAge(),
                patient.getGender(),
                patient.getPhone(),
                isSelf ? "SELF" : "FAMILY",
                isSelf,
                isSelf ? null : relationship);
    }
}
