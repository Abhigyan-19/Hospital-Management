package com.hospital.management.service;

import com.hospital.management.entity.Bill;
import com.hospital.management.entity.BillItem;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class PdfInvoiceGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");

    public byte[] generateInvoicePdf(Bill bill) throws IOException {
        ByteArrayOutputStream streamContent = new ByteArrayOutputStream();

        // Build PDF graphics stream
        StringBuilder sb = new StringBuilder();

        // 1. Header Banner & Hospital Logo / Title
        sb.append("0.04 0.38 0.36 rg\n"); // Teal brand color
        sb.append("40 760 515 50 re f\n"); // Top header bar

        // Brand Text
        sb.append("BT\n");
        sb.append("/F2 20 Tf\n");
        sb.append("1 1 1 rg\n"); // White text
        sb.append("55 780 Td\n");
        sb.append("(").append(escapePdf("SEBASETHU HOSPITAL")).append(") Tj\n");
        sb.append("ET\n");

        sb.append("BT\n");
        sb.append("/F1 9 Tf\n");
        sb.append("1 1 1 rg\n");
        sb.append("55 768 Td\n");
        sb.append("(").append(escapePdf("Patient Care & Clinical Management | Helpline: +91 7890100849")).append(") Tj\n");
        sb.append("ET\n");

        // Document Title
        sb.append("BT\n");
        sb.append("/F2 16 Tf\n");
        sb.append("0.1 0.1 0.2 rg\n");
        sb.append("40 725 Td\n");
        sb.append("(").append(escapePdf("TAX INVOICE")).append(") Tj\n");
        sb.append("ET\n");

        // Thin separator rule
        sb.append("0.8 0.82 0.85 RG\n");
        sb.append("1 w\n");
        sb.append("40 715 m 555 715 l S\n");

        // 2. Invoice & Patient Metadata (2-column layout)
        // Left Column: Patient Details
        sb.append("BT\n");
        sb.append("/F2 10 Tf\n");
        sb.append("0.15 0.15 0.2 rg\n");
        sb.append("40 695 Td\n");
        sb.append("(BILLED TO:) Tj\n");
        sb.append("/F2 11 Tf\n");
        sb.append("0 -16 Td\n");
        String patientName = (bill.getPatient() != null && bill.getPatient().getName() != null)
                ? bill.getPatient().getName()
                : "Walk-in Patient";
        sb.append("(").append(escapePdf(patientName)).append(") Tj\n");
        sb.append("/F1 9 Tf\n");
        sb.append("0.3 0.3 0.3 rg\n");
        sb.append("0 -14 Td\n");
        Long pId = bill.getPatient() != null ? bill.getPatient().getId() : 0L;
        String pPhone = (bill.getPatient() != null && bill.getPatient().getPhone() != null) ? bill.getPatient().getPhone() : "N/A";
        sb.append("(").append(escapePdf("Patient ID: #" + pId + "  |  Phone: " + pPhone)).append(") Tj\n");
        sb.append("0 -14 Td\n");
        String pBlood = (bill.getPatient() != null && bill.getPatient().getBloodGroup() != null) ? bill.getPatient().getBloodGroup() : "N/A";
        sb.append("(").append(escapePdf("Blood Group: " + pBlood)).append(") Tj\n");
        sb.append("ET\n");

        // Right Column: Invoice Details
        sb.append("BT\n");
        sb.append("/F2 10 Tf\n");
        sb.append("0.15 0.15 0.2 rg\n");
        sb.append("340 695 Td\n");
        sb.append("(INVOICE DETAILS:) Tj\n");
        sb.append("/F1 9 Tf\n");
        sb.append("0.3 0.3 0.3 rg\n");
        sb.append("0 -16 Td\n");
        sb.append("(").append(escapePdf("Invoice No: " + bill.getInvoiceNumber())).append(") Tj\n");
        sb.append("0 -14 Td\n");
        String dateStr = bill.getCreatedAt() != null ? bill.getCreatedAt().format(DATE_FORMATTER) : "N/A";
        sb.append("(").append(escapePdf("Date & Time: " + dateStr)).append(") Tj\n");
        sb.append("0 -14 Td\n");
        String pMethod = bill.getPaymentMethod() != null ? bill.getPaymentMethod() : "PENDING";
        sb.append("(").append(escapePdf("Payment Method: " + pMethod)).append(") Tj\n");
        sb.append("ET\n");

        // 3. Status Badge Box
        boolean isPaid = "PAID".equalsIgnoreCase(bill.getStatus());
        if (isPaid) {
            sb.append("0.9 0.98 0.93 rg\n"); // Light green background
            sb.append("450 640 105 24 re f\n");
            sb.append("0.12 0.55 0.25 RG\n");
            sb.append("1 w\n");
            sb.append("450 640 105 24 re S\n");
            sb.append("BT\n");
            sb.append("/F2 10 Tf\n");
            sb.append("0.12 0.55 0.25 rg\n");
            sb.append("470 648 Td\n");
            sb.append("(PAID)").append(" Tj\n");
            sb.append("ET\n");
        } else {
            sb.append("1 0.96 0.9 rg\n"); // Light amber background
            sb.append("450 640 105 24 re f\n");
            sb.append("0.85 0.45 0.05 RG\n");
            sb.append("1 w\n");
            sb.append("450 640 105 24 re S\n");
            sb.append("BT\n");
            sb.append("/F2 10 Tf\n");
            sb.append("0.85 0.45 0.05 rg\n");
            sb.append("465 648 Td\n");
            sb.append("(PENDING)").append(" Tj\n");
            sb.append("ET\n");
        }

        // 4. Itemized Table
        int tableTopY = 600;

        // Table Header
        sb.append("0.95 0.96 0.98 rg\n");
        sb.append("40 ").append(tableTopY - 20).append(" 515 22 re f\n");
        sb.append("0.85 0.87 0.9 RG\n");
        sb.append("40 ").append(tableTopY - 20).append(" 515 22 re S\n");

        sb.append("BT\n");
        sb.append("/F2 9 Tf\n");
        sb.append("0.15 0.2 0.3 rg\n");
        sb.append("50 ").append(tableTopY - 14).append(" Td\n");
        sb.append("(ITEM DESCRIPTION) Tj\n");
        sb.append("310 0 Td\n");
        sb.append("(QTY) Tj\n");
        sb.append("60 0 Td\n");
        sb.append("(UNIT PRICE) Tj\n");
        sb.append("80 0 Td\n");
        sb.append("(TOTAL) Tj\n");
        sb.append("ET\n");

        // Table Rows
        int rowY = tableTopY - 38;
        List<BillItem> items = bill.getItems();
        if (items == null || items.isEmpty()) {
            items = new ArrayList<>();
            BillItem fallbackItem = new BillItem(bill, bill.getDescription(), 1, bill.getSubtotal());
            items.add(fallbackItem);
        }

        for (int i = 0; i < items.size(); i++) {
            BillItem item = items.get(i);
            if (i % 2 == 1) {
                sb.append("0.98 0.98 0.99 rg\n");
                sb.append("40 ").append(rowY - 4).append(" 515 18 re f\n");
            }

            sb.append("BT\n");
            sb.append("/F1 9 Tf\n");
            sb.append("0.2 0.2 0.25 rg\n");
            sb.append("50 ").append(rowY).append(" Td\n");
            sb.append("(").append(escapePdf(truncate(item.getDescription(), 45))).append(") Tj\n");
            sb.append("315 0 Td\n");
            sb.append("(").append(item.getQuantity()).append(") Tj\n");
            sb.append("60 0 Td\n");
            sb.append("(").append(String.format(Locale.ENGLISH, "Rs. %.2f", item.getUnitPrice())).append(") Tj\n");
            sb.append("80 0 Td\n");
            sb.append("(").append(String.format(Locale.ENGLISH, "Rs. %.2f", item.getTotalPrice())).append(") Tj\n");
            sb.append("ET\n");

            rowY -= 20;
        }

        // Table bottom border
        sb.append("0.85 0.87 0.9 RG\n");
        sb.append("40 ").append(rowY + 12).append(" m 555 ").append(rowY + 12).append(" l S\n");

        // 5. Financial Summary Box
        int summaryY = rowY - 10;
        sb.append("BT\n");
        sb.append("/F1 9 Tf\n");
        sb.append("0.3 0.3 0.35 rg\n");
        sb.append("360 ").append(summaryY).append(" Td\n");
        sb.append("(Subtotal:) Tj\n");
        sb.append("90 0 Td\n");
        sb.append("(").append(String.format(Locale.ENGLISH, "Rs. %.2f", bill.getSubtotal())).append(") Tj\n");

        sb.append("-90 -16 Td\n");
        double ratePct = (bill.getTaxRate() != null ? bill.getTaxRate() : 0.18) * 100.0;
        sb.append("(").append(String.format(Locale.ENGLISH, "GST (%.0f%%):", ratePct)).append(") Tj\n");
        sb.append("90 0 Td\n");
        sb.append("(").append(String.format(Locale.ENGLISH, "Rs. %.2f", bill.getTaxAmount())).append(") Tj\n");
        sb.append("ET\n");

        // Grand Total Row with accent bar
        sb.append("0.04 0.38 0.36 rg\n");
        sb.append("350 ").append(summaryY - 42).append(" 205 22 re f\n");

        sb.append("BT\n");
        sb.append("/F2 10 Tf\n");
        sb.append("1 1 1 rg\n");
        sb.append("360 ").append(summaryY - 36).append(" Td\n");
        sb.append("(GRAND TOTAL:) Tj\n");
        sb.append("90 0 Td\n");
        sb.append("(").append(String.format(Locale.ENGLISH, "Rs. %.2f", bill.getAmount())).append(") Tj\n");
        sb.append("ET\n");

        // 6. Payment Timestamp & Receipt Details
        if (isPaid && bill.getPaidAt() != null) {
            sb.append("BT\n");
            sb.append("/F1 8 Tf\n");
            sb.append("0.3 0.5 0.35 rg\n");
            sb.append("40 ").append(summaryY - 30).append(" Td\n");
            sb.append("(").append(escapePdf("Payment verified on " + bill.getPaidAt().format(DATE_FORMATTER) + " via " + bill.getPaymentMethod())).append(") Tj\n");
            sb.append("ET\n");
        }

        // 7. Footer
        sb.append("0.9 0.9 0.92 RG\n");
        sb.append("40 70 m 555 70 l S\n");

        sb.append("BT\n");
        sb.append("/F1 8 Tf\n");
        sb.append("0.4 0.45 0.5 rg\n");
        sb.append("40 52 Td\n");
        sb.append("(").append(escapePdf("This is a computer-generated tax invoice issued by Sebasethu Hospital.")).append(") Tj\n");
        sb.append("0 -11 Td\n");
        sb.append("(").append(escapePdf("Questions or disputes? Please contact billing desk at +91 7890100849 or visit our accounts office.")).append(") Tj\n");
        sb.append("ET\n");

        byte[] streamBytes = sb.toString().getBytes(StandardCharsets.US_ASCII);

        // Assemble Standard PDF 1.4 Object Structure
        ByteArrayOutputStream pdf = new ByteArrayOutputStream();
        List<Integer> offsets = new ArrayList<>();

        pdf.write("%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n".getBytes(StandardCharsets.ISO_8859_1));

        // Object 1: Catalog
        offsets.add(pdf.size());
        pdf.write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // Object 2: Pages
        offsets.add(pdf.size());
        pdf.write("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // Object 3: Page (A4: 595.28 x 841.89 pt)
        offsets.add(pdf.size());
        pdf.write(("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] " +
                "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n").getBytes(StandardCharsets.US_ASCII));

        // Object 4: Font F1 (Helvetica)
        offsets.add(pdf.size());
        pdf.write("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // Object 5: Font F2 (Helvetica-Bold)
        offsets.add(pdf.size());
        pdf.write("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // Object 6: Content Stream
        offsets.add(pdf.size());
        String streamHeader = "6 0 obj\n<< /Length " + streamBytes.length + " >>\nstream\n";
        pdf.write(streamHeader.getBytes(StandardCharsets.US_ASCII));
        pdf.write(streamBytes);
        pdf.write("\nendstream\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // Cross-reference table (xref)
        int startXref = pdf.size();
        pdf.write("xref\n0 7\n".getBytes(StandardCharsets.US_ASCII));
        pdf.write("0000000000 65535 f \n".getBytes(StandardCharsets.US_ASCII));
        for (int offset : offsets) {
            pdf.write(String.format(Locale.ENGLISH, "%010d 00000 n \n", offset).getBytes(StandardCharsets.US_ASCII));
        }

        // Trailer
        pdf.write(("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n" + startXref + "\n%%EOF\n").getBytes(StandardCharsets.US_ASCII));

        return pdf.toByteArray();
    }

    private String escapePdf(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("(", "\\(")
                   .replace(")", "\\)")
                   .replace("\r", " ")
                   .replace("\n", " ");
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }
}
