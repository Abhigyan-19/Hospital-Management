package com.hospital.management.service;

import com.hospital.management.entity.AuditLog;
import com.hospital.management.repository.AuditLogRepository;
import com.hospital.management.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Records an audit log entry in a separate transaction so that audit failures
     * never roll back primary clinical business logic.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordLog(CustomUserDetails userDetails,
                          String action,
                          String entity,
                          String entityId,
                          String summary,
                          HttpServletRequest request) {
        try {
            Long userId = null;
            String actorName = "Anonymous / System";
            String role = "SYSTEM";

            if (userDetails != null && userDetails.getUser() != null) {
                userId = userDetails.getId();
                actorName = userDetails.getUser().getFullName() != null
                        ? userDetails.getUser().getFullName()
                        : userDetails.getUsername();
                role = userDetails.getUser().getRole() != null
                        ? userDetails.getUser().getRole().name()
                        : "USER";
            }

            String ipAddress = "127.0.0.1";
            if (request != null) {
                String forwardedFor = request.getHeader("X-Forwarded-For");
                if (forwardedFor != null && !forwardedFor.isBlank()) {
                    ipAddress = forwardedFor.split(",")[0].trim();
                } else {
                    ipAddress = request.getRemoteAddr();
                }
            } else {
                ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attrs != null && attrs.getRequest() != null) {
                    HttpServletRequest req = attrs.getRequest();
                    String forwardedFor = req.getHeader("X-Forwarded-For");
                    if (forwardedFor != null && !forwardedFor.isBlank()) {
                        ipAddress = forwardedFor.split(",")[0].trim();
                    } else {
                        ipAddress = req.getRemoteAddr();
                    }
                }
            }

            AuditLog entry = new AuditLog(
                    userId,
                    actorName,
                    role,
                    action,
                    entity,
                    entityId,
                    summary,
                    ipAddress
            );

            auditLogRepository.save(entry);
        } catch (Exception ex) {
            log.error("Failed to record audit log: action={}, entity={}, entityId={}", action, entity, entityId, ex);
        }
    }

    public List<AuditLog> getAuditLogs(String fromDate, String toDate, String action, String entity) {
        LocalDateTime from = null;
        LocalDateTime to = null;

        if (fromDate != null && !fromDate.isBlank()) {
            try {
                from = LocalDate.parse(fromDate.trim()).atStartOfDay();
            } catch (Exception ignored) {
            }
        }
        if (toDate != null && !toDate.isBlank()) {
            try {
                to = LocalDate.parse(toDate.trim()).atTime(LocalTime.MAX);
            } catch (Exception ignored) {
            }
        }

        String filterAction = (action != null && !action.isBlank()) ? action.trim().toUpperCase() : null;
        String filterEntity = (entity != null && !entity.isBlank()) ? entity.trim().toUpperCase() : null;

        return auditLogRepository.findWithFilters(filterEntity, filterAction, from, to);
    }
}
