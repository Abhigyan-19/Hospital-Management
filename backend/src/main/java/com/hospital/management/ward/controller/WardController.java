package com.hospital.management.ward.controller;

import com.hospital.management.ward.dto.WardRequest;
import com.hospital.management.ward.entity.Ward;
import com.hospital.management.ward.service.WardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wards")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    @GetMapping
    public List<Ward> getAllWards() {
        return wardService.getAllWards();
    }

    @PostMapping
    public Ward createWard(@RequestBody WardRequest request) {
        return wardService.createWard(request);
    }

    @DeleteMapping("/{id}")
    public void deleteWard(@PathVariable Long id) {
        wardService.deleteWard(id);
    }
}