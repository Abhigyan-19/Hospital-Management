package com.hospital.management.security;

import com.hospital.management.doctor.entity.Doctor;
import com.hospital.management.doctor.repository.DoctorRepository;
import com.hospital.management.patient.entity.Patient;
import com.hospital.management.patient.repository.PatientRepository;
import com.hospital.management.security.dto.AuthResponse;
import com.hospital.management.security.dto.LoginRequest;
import com.hospital.management.security.dto.RegisterRequest;
import com.hospital.management.security.dto.RegistrationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {
    private final UserAccountRepository userAccountRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userAccountRepository = userAccountRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegistrationResponse register(RegisterRequest request) {
        if (request.role() != UserRole.PATIENT && request.role() != UserRole.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Self-registration is available only for patients and doctors.");
        }
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        UserAccount account = userAccountRepository.save(new UserAccount(
                email,
                passwordEncoder.encode(request.password()),
                request.name().trim(),
                request.phone().trim(),
                request.role()));

        if (request.role() == UserRole.PATIENT) {
            createPatientProfile(account, request);
            return new RegistrationResponse("REGISTERED", "Patient account created. You can now sign in.");
        }

        if (request.specialization() == null || request.specialization().isBlank() || request.experience() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor specialty and experience are required.");
        }
        Doctor doctor = new Doctor(request.name().trim(), request.specialization().trim(), request.experience());
        doctor.setPhone(request.phone().trim());
        doctor.setApprovalStatus("PENDING");
        doctor.setAccount(account);
        doctorRepository.save(doctor);
        return new RegistrationResponse("PENDING", "Doctor registration submitted and is pending administrator approval.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(user -> passwordEncoder.matches(request.password(), user.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect."));
        if (!account.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is inactive. Contact a hospital administrator.");
        }
        if (account.getRole() != request.role()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "The selected account type does not match this account.");
        }

        Doctor doctor = doctorRepository.findByAccount_Id(account.getId()).orElse(null);
        if (account.getRole() == UserRole.DOCTOR && (doctor == null || !"APPROVED".equals(doctor.getApprovalStatus()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, doctor != null && "REJECTED".equals(doctor.getApprovalStatus())
                    ? "This doctor registration was not approved."
                    : "This doctor account is pending administrator approval.");
        }
        Long patientId = patientRepository.findByOwnerAccount_IdOrderByIdAsc(account.getId())
                .stream().findFirst().map(Patient::getId).orElse(null);
        return new AuthResponse(jwtService.issue(account), new AuthResponse.UserResponse(
                account.getId(),
                account.getEmail(),
                account.getName(),
                account.getRole().name(),
                patientId,
                doctor == null ? null : doctor.getId(),
                doctor == null ? null : doctor.getApprovalStatus()));
    }

    private void createPatientProfile(UserAccount account, RegisterRequest request) {
        String relation = request.patientRelationship() == null ? "SELF" : request.patientRelationship().toUpperCase(Locale.ROOT);
        if (!"SELF".equals(relation) && !"FAMILY".equals(relation)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient relationship must be SELF or FAMILY.");
        }
        String patientName = "FAMILY".equals(relation) ? request.patientName() : request.name();
        if (patientName == null || patientName.isBlank() || request.age() == null || request.gender() == null || request.gender().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient name, age, and gender are required.");
        }
        Patient patient = new Patient(patientName.trim(), request.age(), request.gender().trim(), request.phone().trim());
        patient.setOwnerAccount(account);
        patient.setRelationshipToAccount("SELF".equals(relation) ? "SELF" : request.relationship());
        patientRepository.save(patient);
    }
}
