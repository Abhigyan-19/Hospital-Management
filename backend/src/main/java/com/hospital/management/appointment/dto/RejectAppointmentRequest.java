package com.hospital.management.appointment.dto;

import jakarta.validation.constraints.Size;

public record RejectAppointmentRequest(@Size(max = 1000) String reason) {
}
