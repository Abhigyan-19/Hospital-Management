package com.hospital.management.dto;

import com.hospital.management.entity.Appointment;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.Prescription;

import java.util.ArrayList;
import java.util.List;

public class PatientChartDto {

    private Patient patient;
    private List<Appointment> appointments = new ArrayList<>();
    private List<MedicalRecordResponse> medicalHistory = new ArrayList<>();
    private List<Prescription> prescriptions = new ArrayList<>();
    private List<Object> labReports = new ArrayList<>();

    public PatientChartDto() {
    }

    public PatientChartDto(Patient patient,
                           List<Appointment> appointments,
                           List<MedicalRecordResponse> medicalHistory,
                           List<Prescription> prescriptions,
                           List<Object> labReports) {
        this.patient = patient;
        this.appointments = appointments != null ? appointments : new ArrayList<>();
        this.medicalHistory = medicalHistory != null ? medicalHistory : new ArrayList<>();
        this.prescriptions = prescriptions != null ? prescriptions : new ArrayList<>();
        this.labReports = labReports != null ? labReports : new ArrayList<>();
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<MedicalRecordResponse> getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(List<MedicalRecordResponse> medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    public List<Prescription> getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(List<Prescription> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public List<Object> getLabReports() {
        return labReports;
    }

    public void setLabReports(List<Object> labReports) {
        this.labReports = labReports;
    }
}
