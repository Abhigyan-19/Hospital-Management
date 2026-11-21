package com.hospital.management.admin.service;

import com.hospital.management.admin.dto.UserResponse;
import com.hospital.management.security.AuthenticatedUser;
import com.hospital.management.security.UserAccount;
import com.hospital.management.security.UserAccountRepository;
import com.hospital.management.security.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminAccountService {
    private final UserAccountRepository userAccountRepository;

    public AdminAccountService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userAccountRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional
    public UserResponse updateStatus(Long id, boolean active, AuthenticatedUser actor) {
        UserAccount account = getAccount(id);
        ensureNotLastAdmin(account, active, account.getRole());
        account.setActive(active);
        return UserResponse.from(account);
    }

    @Transactional
    public UserResponse updateRole(Long id, UserRole role, AuthenticatedUser actor) {
        UserAccount account = getAccount(id);
        if (account.getId().equals(actor.id()) && role != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Administrators cannot change their own role.");
        }
        ensureNotLastAdmin(account, account.isActive(), role);
        account.setRole(role);
        return UserResponse.from(account);
    }

    private void ensureNotLastAdmin(UserAccount account, boolean active, UserRole role) {
        if (account.getRole() == UserRole.ADMIN && (!active || role != UserRole.ADMIN)
                && userAccountRepository.findByRoleAndActiveTrue(UserRole.ADMIN).size() <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The last active administrator cannot be deactivated or demoted.");
        }
    }

    private UserAccount getAccount(Long id) {
        return userAccountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User account not found."));
    }
}
