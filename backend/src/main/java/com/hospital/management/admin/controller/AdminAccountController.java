package com.hospital.management.admin.controller;

import com.hospital.management.admin.dto.UserResponse;
import com.hospital.management.admin.dto.UserRoleRequest;
import com.hospital.management.admin.dto.UserStatusRequest;
import com.hospital.management.admin.service.AdminAccountService;
import com.hospital.management.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAccountController {
    private final AdminAccountService adminAccountService;

    public AdminAccountController(AdminAccountService adminAccountService) {
        this.adminAccountService = adminAccountService;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return adminAccountService.listUsers();
    }

    @PatchMapping("/{id}/status")
    public UserResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return adminAccountService.updateStatus(id, request.active(), user);
    }

    @PatchMapping("/{id}/role")
    public UserResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return adminAccountService.updateRole(id, request.role(), user);
    }
}
