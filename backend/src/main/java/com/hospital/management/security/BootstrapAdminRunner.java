package com.hospital.management.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class BootstrapAdminRunner implements ApplicationRunner {
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public BootstrapAdminRunner(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            @Value("${APP_BOOTSTRAP_ADMIN_EMAIL:}") String email,
            @Value("${APP_BOOTSTRAP_ADMIN_PASSWORD:}") String password) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) {
            return;
        }
        if (email.isBlank() || password.isBlank() || password.length() < 12) {
            throw new IllegalStateException("Configure both APP_BOOTSTRAP_ADMIN_EMAIL and a 12-character APP_BOOTSTRAP_ADMIN_PASSWORD.");
        }
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (!userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            userAccountRepository.save(new UserAccount(
                    normalizedEmail,
                    passwordEncoder.encode(password),
                    "Hospital Administrator",
                    null,
                    UserRole.ADMIN));
        }
    }
}
