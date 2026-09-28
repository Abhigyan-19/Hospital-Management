package com.hospital.management.service;

import com.hospital.management.dto.BedRequest;
import com.hospital.management.dto.BedResponse;
import com.hospital.management.entity.Bed;
import com.hospital.management.entity.BedStatus;
import com.hospital.management.entity.Patient;
import com.hospital.management.entity.Ward;
import com.hospital.management.repository.BedRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.repository.WardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class BedService {

    private final BedRepository bedRepository;
    private final WardRepository wardRepository;
    private final PatientRepository patientRepository;

    public BedService(BedRepository bedRepository, WardRepository wardRepository, PatientRepository patientRepository) {
        this.bedRepository = bedRepository;
        this.wardRepository = wardRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public List<BedResponse> getAllBeds() {
        return bedRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public BedResponse createBed(BedRequest request) {
        if (request.bedNumber() == null || request.bedNumber().isBlank() || request.wardId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bed number and ward are required.");
        }
        Ward ward = wardRepository.findById(request.wardId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ward not found."));
        String bedNumber = request.bedNumber().trim().toUpperCase(Locale.ROOT);
        if (bedRepository.existsByWard_IdAndBedNumberIgnoreCase(ward.getId(), bedNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That bed number already exists in this ward.");
        }
        return toResponse(bedRepository.save(new Bed(bedNumber, ward)));
    }

    @Transactional
    public BedResponse assignPatient(Long bedId, Long patientId) {
        Bed bed = getBed(bedId);
        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only available beds can be assigned.");
        }
        if (patientId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A patient is required for bed assignment.");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found."));
        if (bedRepository.existsByPatient_Id(patientId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This patient is already assigned to a bed.");
        }
        bed.setPatient(patient);
        bed.setStatus(BedStatus.OCCUPIED);
        return toResponse(bedRepository.save(bed));
    }

    @Transactional
    public BedResponse releaseBed(Long bedId) {
        Bed bed = getBed(bedId);
        if (bed.getStatus() != BedStatus.OCCUPIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only occupied beds can be released.");
        }
        bed.setPatient(null);
        bed.setStatus(BedStatus.AVAILABLE);
        return toResponse(bedRepository.save(bed));
    }

    @Transactional
    public BedResponse updateStatus(Long bedId, BedStatus status) {
        if (status == null || status == BedStatus.OCCUPIED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose available or maintenance status.");
        }
        Bed bed = getBed(bedId);
        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Release the bed before changing its status.");
        }
        bed.setStatus(status);
        return toResponse(bedRepository.save(bed));
    }

    @Transactional
    public void deleteBed(Long id) {
        Bed bed = getBed(id);
        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Release the bed before deleting it.");
        }
        bedRepository.delete(bed);
    }

    private Bed getBed(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bed not found."));
    }

    private BedResponse toResponse(Bed bed) {
        Patient patient = bed.getPatient();
        return new BedResponse(
                bed.getId(),
                bed.getBedNumber(),
                bed.getStatus(),
                bed.getWard().getId(),
                bed.getWard().getName(),
                patient == null ? null : patient.getId(),
                patient == null ? null : patient.getName());
    }
}