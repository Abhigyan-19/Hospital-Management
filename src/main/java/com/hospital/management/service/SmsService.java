package com.hospital.management.service;

import com.hospital.management.entity.Doctor;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.PrescriptionMedicine;
import com.hospital.management.entity.SmsNotification;
import com.hospital.management.repository.SmsNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final SmsNotificationRepository smsRepository;
    private final HttpClient httpClient;

    @Value("${sms.provider:mock}")
    private String smsProvider;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.from-phone:}")
    private String twilioFromPhone;

    @Value("${fast2sms.api-key:}")
    private String fast2SmsApiKey;

    public SmsService(SmsNotificationRepository smsRepository) {
        this.smsRepository = smsRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendAppointmentBookingSms(Patient patient, Doctor doctor, String date, String time) {
        if (patient == null) return;
        String message = String.format(
                "Hello %s, your appointment with Dr. %s (%s) is confirmed for %s at %s. - Sebasethu Hospital",
                patient.getName(), doctor.getName(), doctor.getSpecialization(), date, time
        );
        dispatchSms(patient, "BOOKING_CONFIRMATION", message);
    }

    public void sendAppointmentCompletedSms(Patient patient, Doctor doctor, String date) {
        if (patient == null) return;
        String message = String.format(
                "Hello %s, your consultation with Dr. %s on %s has been marked as COMPLETED. Thank you for visiting Sebasethu Hospital.",
                patient.getName(), doctor != null ? doctor.getName() : "your doctor", date
        );
        dispatchSms(patient, "APPOINTMENT_COMPLETED", message);
    }

    public void sendBedAssignedSms(Patient patient, String wardName, String bedNumber) {
        if (patient == null) return;
        String message = String.format(
                "Hello %s, you have been assigned to %s, Bed Number: %s at Sebasethu Hospital. Please visit the care desk for check-in.",
                patient.getName(), wardName, bedNumber
        );
        dispatchSms(patient, "BED_ASSIGNED", message);
    }

    public void sendPrescriptionSms(Patient patient, Doctor doctor, List<PrescriptionMedicine> medicines, String notes) {
        if (patient == null) return;
        String medsSummary = medicines == null || medicines.isEmpty()
                ? "As prescribed"
                : medicines.stream()
                .map(m -> m.getName() + " (" + m.getDosage() + ", " + m.getFrequency() + ")")
                .collect(Collectors.joining("; "));

        String notesPart = (notes != null && !notes.isBlank()) ? " | Advice: " + notes : "";

        String message = String.format(
                "Hello %s, Dr. %s issued your prescription. Rx: [%s]%s. Get well soon! - Sebasethu Hospital",
                patient.getName(), doctor != null ? doctor.getName() : "Consultant", medsSummary, notesPart
        );
        dispatchSms(patient, "PRESCRIPTION_ISSUED", message);
    }

    public void sendBillingSms(Patient patient, String invoiceNumber, double amount, String description, String status) {
        if (patient == null) return;
        String message = String.format(
                "Hello %s, invoice %s for Rs. %.2f (%s) status: %s. - Sebasethu Hospital",
                patient.getName(), invoiceNumber, amount, description, status
        );
        dispatchSms(patient, "BILLING_INVOICE", message);
    }

    private void dispatchSms(Patient patient, String type, String message) {
        String phone = patient.getPhone();
        String name = patient.getName();
        String status = "SENT";

        if (phone == null || phone.isBlank()) {
            log.warn("Cannot send SMS: Patient {} has no phone number.", name);
            return;
        }

        try {
            if ("twilio".equalsIgnoreCase(smsProvider) && isTwilioConfigured()) {
                sendViaTwilio(phone, message);
                status = "SENT (TWILIO)";
            } else if ("fast2sms".equalsIgnoreCase(smsProvider) && isFast2SmsConfigured()) {
                sendViaFast2Sms(phone, message);
                status = "SENT (FAST2SMS)";
            } else {
                status = "SENT (SIMULATED)";
            }

            log.info("\n================== SMS DISPATCHED ==================\n" +
                            "To: {} ({})\n" +
                            "Type: {}\n" +
                            "Status: {}\n" +
                            "Message: {}\n" +
                            "====================================================",
                    phone, name, type, status, message);

        } catch (Exception e) {
            log.error("Failed to send real SMS to {}: {}", phone, e.getMessage());
            status = "FAILED: " + e.getMessage();
        }

        try {
            SmsNotification notification = new SmsNotification(patient, phone, name, type, message, status);
            smsRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to save SMS log: {}", e.getMessage());
        }
    }

    private boolean isTwilioConfigured() {
        return twilioAccountSid != null && !twilioAccountSid.isBlank()
                && twilioAuthToken != null && !twilioAuthToken.isBlank()
                && twilioFromPhone != null && !twilioFromPhone.isBlank();
    }

    private boolean isFast2SmsConfigured() {
        return fast2SmsApiKey != null && !fast2SmsApiKey.isBlank();
    }

    private void sendViaTwilio(String toPhone, String message) throws Exception {
        String endpoint = String.format(
                "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json",
                twilioAccountSid
        );

        String form = "To=" + URLEncoder.encode(toPhone, StandardCharsets.UTF_8)
                + "&From=" + URLEncoder.encode(twilioFromPhone, StandardCharsets.UTF_8)
                + "&Body=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

        String auth = twilioAccountSid + ":" + twilioAuthToken;
        String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Authorization", basicAuth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 300) {
            throw new RuntimeException("Twilio returned HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    private void sendViaFast2Sms(String toPhone, String message) throws Exception {
        // Clean phone number (strip +91 or spaces for Indian numbers)
        String cleanPhone = toPhone.replaceAll("[^0-9]", "");
        if (cleanPhone.startsWith("91") && cleanPhone.length() == 12) {
            cleanPhone = cleanPhone.substring(2);
        }

        String json = String.format(
                "{\"route\":\"q\",\"message\":\"%s\",\"language\":\"english\",\"numbers\":\"%s\"}",
                message.replace("\"", "\\\""), cleanPhone
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.fast2sms.com/dev/bulkV2"))
                .header("authorization", fast2SmsApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 300) {
            throw new RuntimeException("Fast2SMS returned HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    public List<SmsNotification> getRecentNotifications() {
        return smsRepository.findAllByOrderBySentAtDesc();
    }

    public List<SmsNotification> getNotificationsForPatient(Long patientId) {
        return smsRepository.findByPatient_IdOrderBySentAtDesc(patientId);
    }
}

