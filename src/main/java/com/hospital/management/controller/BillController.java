package com.hospital.management.controller;

import com.hospital.management.dto.BillRequest;
import com.hospital.management.entity.Bill;
import com.hospital.management.service.BillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    @GetMapping("/patient/{patientId}")
    public List<Bill> getBillsForPatient(@PathVariable Long patientId) {
        return billService.getBillsForPatient(patientId);
    }

    @PostMapping
    public Bill createBill(@RequestBody BillRequest request) {
        return billService.createBill(request);
    }

    @PatchMapping("/{id}/status")
    public Bill updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "PAID");
        return billService.updateStatus(id, status);
    }
}

