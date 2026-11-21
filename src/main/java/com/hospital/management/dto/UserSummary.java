package com.hospital.management.dto;

public class UserSummary {
    private Long id;
    private String email;
    private String name;
    private String role;
    private Long doctorId;
    private Long patientId;
    private String approvalStatus;
    private boolean active;

    public UserSummary() {
    }

    public UserSummary(Long id, String email, String name, String role, Long doctorId, Long patientId, String approvalStatus, boolean active) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.approvalStatus = approvalStatus;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
