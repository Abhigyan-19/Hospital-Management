package com.hospital.management.controller;

import com.hospital.management.entity.AuditLog;
import com.hospital.management.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/audit-log")
public class AdminAuditController {

    private final AuditLogService auditLogService;

    public AdminAuditController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entity) {

        List<AuditLog> logs = auditLogService.getAuditLogs(fromDate, toDate, action, entity);
        return ResponseEntity.ok(logs);
    }
}
