package com.hospital.management.service;

import com.hospital.management.dto.*;
import com.hospital.management.entity.*;
import com.hospital.management.exception.RateLimitExceededException;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.repository.RefreshTokenRepository;
import com.hospital.management.repository.UserRepository;
import com.hospital.management.security.JwtService;
import com.hospital.management.security.LoginRateLimiterService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginRateLimiterService rateLimiterService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       LoginRateLimiterService rateLimiterService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rateLimiterService = rateLimiterService;
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp) {
        String rateLimitKey = clientIp + ":" + request.getEmail().trim().toLowerCase();
        if (!rateLimiterService.isAllowed(rateLimitKey)) {
            throw new RateLimitExceededException("Too many failed attempts. Please wait 1 minute before trying again.");
        }

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            if (!user.getRole().name().equalsIgnoreCase(request.getRole().trim())) {
                throw new BadCredentialsException("Selected role does not match this account.");
            }
        }

        if (!user.isActive()) {
            throw new DisabledException("This account is inactive. Please contact the hospital administrator.");
        }

        if (user.getRole() == Role.DOCTOR && !"APPROVED".equalsIgnoreCase(user.getApprovalStatus())) {
            if ("REJECTED".equalsIgnoreCase(user.getApprovalStatus())) {
                throw new DisabledException("This doctor account registration was not approved.");
            }
            throw new DisabledException("Your doctor account is pending verification by a hospital administrator.");
        }

        rateLimiterService.reset(rateLimitKey);

        String accessToken = jwtService.generateToken(user);
        String refreshTokenString = UUID.randomUUID().toString();

        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshToken = new RefreshToken(
                refreshTokenString,
                user,
                Instant.now().plusMillis(jwtService.getRefreshExpirationMs())
        );
        refreshTokenRepository.save(refreshToken);

        UserSummary summary = toSummary(user);
        return new AuthResponse(accessToken, refreshTokenString, summary);
    }

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid role specified. Only PATIENT and DOCTOR can register.");
        }

        if (role != Role.PATIENT && role != Role.DOCTOR) {
            throw new IllegalArgumentException("Self-registration is available only for patients and doctors.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getName().trim());
        user.setRole(role);
        user.setActive(true);

        if (role == Role.PATIENT) {
            Patient patient = new Patient(
                    request.getName().trim(),
                    request.getAge() != null ? request.getAge() : 30,
                    request.getGender() != null ? request.getGender() : "Other",
                    request.getPhone() != null ? request.getPhone() : ""
            );
            patient = patientRepository.save(patient);
            user.setPatientId(patient.getId());
            user.setApprovalStatus("APPROVED");
        } else {
            Doctor doctor = new Doctor(
                    request.getName().trim(),
                    request.getSpecialization() != null ? request.getSpecialization() : "General Medicine",
                    request.getExperience() != null ? request.getExperience() : 2
            );
            doctor = doctorRepository.save(doctor);
            user.setDoctorId(doctor.getId());
            user.setApprovalStatus("PENDING");
        }

        userRepository.save(user);

        return Map.of(
                "status", role == Role.DOCTOR ? "PENDING" : "REGISTERED",
                "message", role == Role.DOCTOR
                        ? "Registration submitted. Your doctor account is pending verification by a hospital administrator."
                        : "Account created successfully. You can now log in with your credentials."
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token."));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BadCredentialsException("Refresh token has expired. Please log in again.");
        }

        User user = token.getUser();
        if (!user.isActive()) {
            throw new DisabledException("Account is inactive.");
        }

        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = UUID.randomUUID().toString();

        token.setToken(newRefreshToken);
        token.setExpiryDate(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()));
        refreshTokenRepository.save(token);

        return new AuthResponse(newAccessToken, newRefreshToken, toSummary(user));
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserSummary toSummary(User user) {
        return new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getDoctorId(),
                user.getPatientId(),
                user.getApprovalStatus(),
                user.isActive()
        );
    }
}
