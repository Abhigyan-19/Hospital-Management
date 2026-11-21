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
    @DisplayName("Should allow login attempts when count is under limit")
    void isBlocked_UnderLimit_ReturnsFalse() {
        String clientIp = "192.168.1.100";
        assertThat(rateLimiterService.isBlocked(clientIp)).isFalse();

        rateLimiterService.recordFailedAttempt(clientIp);
        rateLimiterService.recordFailedAttempt(clientIp);
        rateLimiterService.recordFailedAttempt(clientIp);
        rateLimiterService.recordFailedAttempt(clientIp);

        assertThat(rateLimiterService.isBlocked(clientIp)).isFalse();
    }

    @Test
    @DisplayName("Should block client IP after 5 failed attempts")
    void isBlocked_AfterFiveFailures_ReturnsTrue() {
        String clientIp = "192.168.1.101";

        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailedAttempt(clientIp);
        }

        assertThat(rateLimiterService.isBlocked(clientIp)).isTrue();
    }

    @Test
    @DisplayName("Should unblock client IP when login succeeds")
    void resetAttempts_UnblocksIp() {
        String clientIp = "192.168.1.102";

        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailedAttempt(clientIp);
        }
        assertThat(rateLimiterService.isBlocked(clientIp)).isTrue();

        rateLimiterService.resetAttempts(clientIp);
        assertThat(rateLimiterService.isBlocked(clientIp)).isFalse();
    }
}
