package com.hospital.management.service;

import com.hospital.management.dto.WardRequest;
import com.hospital.management.entity.Ward;
import com.hospital.management.repository.BedRepository;
import com.hospital.management.repository.WardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WardService {

    private final WardRepository wardRepository;
    private final BedRepository bedRepository;

    public WardService(WardRepository wardRepository, BedRepository bedRepository) {
        this.wardRepository = wardRepository;
        this.bedRepository = bedRepository;
    }

    @Transactional(readOnly = true)
    public List<Ward> getAllWards() {
        return wardRepository.findAll();
    }

    public Ward createWard(WardRequest request) {
        if (request.name() == null || request.name().isBlank()
                || request.department() == null || request.department().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ward name and department are required.");
        }
        String name = request.name().trim();
        if (wardRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A ward with that name already exists.");
        }
        if (request.floor() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor cannot be negative.");
        }
        return wardRepository.save(new Ward(name, request.department().trim(), request.floor()));
    }

    @Transactional
    public void deleteWard(Long id) {
        Ward ward = wardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ward not found."));
        if (bedRepository.existsByWard_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Remove the ward's beds before deleting it.");
        }
        wardRepository.delete(ward);
    }
}