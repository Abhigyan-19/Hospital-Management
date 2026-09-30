package com.hospital.management.controller;

import com.hospital.management.dto.WardRequest;
import com.hospital.management.entity.Ward;
import com.hospital.management.service.WardService;
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