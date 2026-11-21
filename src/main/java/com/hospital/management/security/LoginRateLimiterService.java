package com.hospital.management.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory sliding-window rate limiter for authentication endpoints.
 * Blocks brute-force login attempts per client IP/email.
 */
@Service
public class LoginRateLimiterService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 60; // 5 attempts per minute

    private final Map<String, AttemptTracker> attemptsMap = new ConcurrentHashMap<>();

    public boolean isAllowed(String key) {
        cleanup();
        AttemptTracker tracker = attemptsMap.compute(key, (k, existing) -> {
            Instant now = Instant.now();
            if (existing == null || existing.isExpired(now)) {
                return new AttemptTracker(1, now);
            }
            existing.increment();
            return existing;
        });

        return tracker.getCount() <= MAX_ATTEMPTS;
    }

    public void reset(String key) {
        attemptsMap.remove(key);
    }

    private void cleanup() {
        Instant now = Instant.now();
        attemptsMap.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
    }

    private static class AttemptTracker {
        private int count;
        private final Instant firstAttempt;

        public AttemptTracker(int count, Instant firstAttempt) {
            this.count = count;
            this.firstAttempt = firstAttempt;
        }

        public void increment() {
            this.count++;
        }

        public int getCount() {
            return count;
        }

        public boolean isExpired(Instant now) {
            return now.isAfter(firstAttempt.plusSeconds(WINDOW_SECONDS));
        }
    }
}
