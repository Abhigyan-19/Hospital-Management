package com.hospital.management.service;

import com.hospital.management.dto.BillItemRequest;
import com.hospital.management.dto.BillRequest;
import com.hospital.management.entity.Bill;
import com.hospital.management.entity.Patient;
import com.hospital.management.repository.BillRepository;
import com.hospital.management.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock
    private BillRepository billRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private SmsService smsService;
    @Mock
    private PdfInvoiceGenerator pdfInvoiceGenerator;

    @InjectMocks
    private BillService billService;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = new Patient("Maya Iyer", 28, "Female", "+91 9876543210");
        patient.setId(1L);
    }

    @Test
    @DisplayName("Should create itemized bill with 18% GST calculation")
    void createBill_ItemizedWithGst() {
        BillRequest request = new BillRequest();
        request.setPatientId(1L);
        request.setDescription("Specialist visit and diagnostics");
        request.setTaxRate(0.18);
        request.setItems(List.of(
                new BillItemRequest("Consultation", 1, 500.00),
                new BillItemRequest("Blood Panel", 2, 250.00)
        ));

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(billRepository.count()).thenReturn(5L);
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> {
            Bill b = invocation.getArgument(0);
            b.setId(50L);
            return b;
        });

        Bill created = billService.createBill(request);

        assertThat(created).isNotNull();
        assertThat(created.getInvoiceNumber()).isEqualTo("INV-1006");
        // Subtotal = 500 + 2*250 = 1000.00
        assertThat(created.getSubtotal()).isEqualTo(1000.00);
        // Tax @ 18% = 180.00
        assertThat(created.getTaxAmount()).isEqualTo(180.00);
        // Total = 1180.00
        assertThat(created.getAmount()).isEqualTo(1180.00);
        assertThat(created.getItems()).hasSize(2);

        verify(smsService).sendBillingSms(eq(patient), eq("INV-1006"), eq(1180.00), anyString(), eq("PENDING"));
    }

    @Test
    @DisplayName("Should record payment with payment method (UPI) and set paid timestamp")
    void recordPayment_UpdatesStatusAndMethod() {
        Bill bill = new Bill("INV-1001", patient, 1000.0, 0.18, 180.0, 1180.0, "Consultation", "PENDING");
        bill.setId(10L);

        when(billRepository.findById(10L)).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bill paidBill = billService.recordPayment(10L, "UPI");

        assertThat(paidBill.getStatus()).isEqualTo("PAID");
        assertThat(paidBill.getPaymentMethod()).isEqualTo("UPI");
        assertThat(paidBill.getPaidAt()).isNotNull();

        verify(smsService).sendBillingSms(eq(patient), eq("INV-1001"), eq(1180.00), contains("UPI"), eq("PAID"));
    }

    @Test
    @DisplayName("Should invoke PdfInvoiceGenerator and stream bytes")
    void getInvoicePdfBytes_ReturnsBytes() throws IOException {
        Bill bill = new Bill("INV-1001", patient, 500.0, "Consultation", "PAID");
        bill.setId(10L);

        byte[] fakePdf = "%PDF-1.4 test".getBytes();
        when(billRepository.findById(10L)).thenReturn(Optional.of(bill));
        when(pdfInvoiceGenerator.generateInvoicePdf(bill)).thenReturn(fakePdf);

        byte[] result = billService.getInvoicePdfBytes(10L);

        assertThat(result).isEqualTo(fakePdf);
        verify(pdfInvoiceGenerator).generateInvoicePdf(bill);
    }
}
