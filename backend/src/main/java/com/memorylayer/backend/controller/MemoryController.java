package com.memorylayer.backend.controller;

import com.memorylayer.backend.dto.MemoryDTO;
import com.memorylayer.backend.dto.MemoryRequestDTO;
import com.memorylayer.backend.service.AuthService;
import com.memorylayer.backend.service.MemoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST controller for memory management.
 * All endpoints require authentication and enforce user ownership.
 *
 * Endpoints:
 *   GET    /api/memories
 *   GET    /api/memories/{id}
 *   POST   /api/memories
 *   PUT    /api/memories/{id}
 *   DELETE /api/memories/{id}
 *   POST   /api/memories/{id}/approve
 *   POST   /api/memories/{id}/reject
 */
@RestController
@RequestMapping("/api/memories")
public class MemoryController {

    private final MemoryService service;
    private final AuthService authService;

    public MemoryController(MemoryService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    private String getUserId(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        return authService.getUserByEmail(userDetails.getUsername()).userId();
    }

    @GetMapping
    public ResponseEntity<List<MemoryDTO>> getAllMemories(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = getUserId(userDetails);
        List<MemoryDTO> memories = service.getAllMemories(userId);
        return ResponseEntity.ok(memories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemoryDTO> getMemoryById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = getUserId(userDetails);
        MemoryDTO memory = service.getMemoryById(id, userId);
        return ResponseEntity.ok(memory);
    }

    @PostMapping
    public ResponseEntity<MemoryDTO> createMemory(
            @Valid @RequestBody MemoryRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = getUserId(userDetails);
        MemoryDTO memory = service.createMemory(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(memory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemoryDTO> updateMemory(
            @PathVariable String id,
            @Valid @RequestBody MemoryRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = getUserId(userDetails);
        MemoryDTO memory = service.updateMemory(id, userId, request);
        return ResponseEntity.ok(memory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = getUserId(userDetails);
        service.deleteMemory(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<MemoryDTO> approveMemory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = getUserId(userDetails);
        MemoryDTO memory = service.approveMemory(id, userId);
        return ResponseEntity.ok(memory);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<MemoryDTO> rejectMemory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = getUserId(userDetails);
        MemoryDTO memory = service.rejectMemory(id, userId);
        return ResponseEntity.ok(memory);
    }
}
