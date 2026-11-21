package com.hospital.management.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LoginRateLimiterServiceTest {

    private LoginRateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new LoginRateLimiterService();
    }

    @Test
    @DisplayName("Should allow initial 5 login attempts within window")
    void isAllowed_UnderLimit_ReturnsTrue() {
        String clientIp = "192.168.1.100";

        // First 5 attempts must be allowed
        for (int i = 0; i < 5; i++) {
            assertThat(rateLimiterService.isAllowed(clientIp)).isTrue();
        }
    }

    @Test
    @DisplayName("Should block client IP on 6th attempt within window")
    void isAllowed_AfterMaxAttempts_ReturnsFalse() {
        String clientIp = "192.168.1.101";

        for (int i = 0; i < 5; i++) {
            rateLimiterService.isAllowed(clientIp);
        }

        // 6th attempt must be blocked
        assertThat(rateLimiterService.isAllowed(clientIp)).isFalse();
    }

    @Test
    @DisplayName("Should reset attempt count on successful authentication")
    void reset_UnblocksIp() {
        String clientIp = "192.168.1.102";

        for (int i = 0; i < 5; i++) {
            rateLimiterService.isAllowed(clientIp);
        }
        assertThat(rateLimiterService.isAllowed(clientIp)).isFalse();

        // Successful login resets tracker
        rateLimiterService.reset(clientIp);
        assertThat(rateLimiterService.isAllowed(clientIp)).isTrue();
    }
}
