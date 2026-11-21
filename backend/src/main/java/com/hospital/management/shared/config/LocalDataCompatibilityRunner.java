package com.hospital.management.shared.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSetMetaData;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@Component
@Profile("local")
public class LocalDataCompatibilityRunner implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    public LocalDataCompatibilityRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Boolean hasLegacyDateAndTime = jdbcTemplate.query(
                "SELECT * FROM appointments WHERE 1 = 0",
                result -> {
                    ResultSetMetaData metadata = result.getMetaData();
                    boolean hasDate = false;
                    boolean hasTime = false;
                    for (int index = 1; index <= metadata.getColumnCount(); index++) {
                        hasDate |= "date".equalsIgnoreCase(metadata.getColumnLabel(index));
                        hasTime |= "time".equalsIgnoreCase(metadata.getColumnLabel(index));
                    }
                    return hasDate && hasTime;
                });
        if (!Boolean.TRUE.equals(hasLegacyDateAndTime)) {
            jdbcTemplate.update("UPDATE doctor SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
            return;
        }
        List<LegacyAppointment> appointments = jdbcTemplate.query(
                "SELECT id, date, time, status FROM appointments",
                (result, row) -> new LegacyAppointment(
                        result.getLong("id"),
                        result.getString("date"),
                        result.getString("time"),
                        result.getString("status")));
        for (LegacyAppointment appointment : appointments) {
            LocalDate date;
            LocalTime time;
            try {
                date = LocalDate.parse(appointment.date());
                time = LocalTime.parse(appointment.time());
            } catch (DateTimeParseException | NullPointerException exception) {
                throw new IllegalStateException(
                        "Existing appointment " + appointment.id()
                                + " has an invalid date or time and must be corrected before startup.",
                        exception);
            }
            String status = normalizeStatus(appointment.status(), appointment.id());
            jdbcTemplate.update(
                    "UPDATE appointments SET appointment_date = ?, appointment_time = ?, "
                            + "duration_minutes = COALESCE(duration_minutes, 30), "
                            + "version = COALESCE(version, 0), status = ? WHERE id = ?",
                    date,
                    time,
                    status,
                    appointment.id());
        }
        jdbcTemplate.update("UPDATE doctor SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
    }

    private String normalizeStatus(String status, Long appointmentId) {
        if (status == null) {
            return "PENDING";
        }
        return switch (status.trim().toLowerCase(Locale.ROOT)) {
            case "pending" -> "PENDING";
            case "approved", "confirmed" -> "APPROVED";
            case "rejected" -> "REJECTED";
            case "scheduled" -> "SCHEDULED";
            case "cancelled", "canceled" -> "CANCELLED";
            case "completed" -> "COMPLETED";
            default -> throw new IllegalStateException(
                    "Existing appointment " + appointmentId + " has an unsupported status: " + status);
        };
    }

    private record LegacyAppointment(Long id, String date, String time, String status) {
    }
}
