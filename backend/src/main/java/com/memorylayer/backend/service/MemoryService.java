package com.memorylayer.backend.service;

import com.memorylayer.backend.dto.MemoryDTO;
import com.memorylayer.backend.dto.MemoryRequestDTO;
import com.memorylayer.backend.entity.MemoryEntity;
import com.memorylayer.backend.exception.ResourceNotFoundException;
import com.memorylayer.backend.repository.MemoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Business logic layer for memory operations.
 * All methods are transactional and enforce user ownership.
 */
@Service
@Transactional
public class MemoryService {

    private final MemoryRepository repository;

    public MemoryService(MemoryRepository repository) {
        this.repository = repository;
    }

    /**
     * Return all memories belonging to the given user.
     */
    public List<MemoryDTO> getAllMemories(String userId) {
        return repository.findByUserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Return a single memory by its UUID id, only if owned by the user.
     * @throws ResourceNotFoundException if no memory with that id exists for the user
     */
    public MemoryDTO getMemoryById(String id, String userId) {
        MemoryEntity entity = repository.findByMemoryIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Memory not found with id: " + id));
        return toDto(entity);
    }

    /**
     * Create a new memory for the given user.
     * AI_INFERRED memories default to PENDING_REVIEW status.
     * USER_ADDED memories default to ACTIVE status.
     * Never auto-approves AI-inferred memories.
     */
    public MemoryDTO createMemory(MemoryRequestDTO request, String userId) {
        MemoryEntity entity = new MemoryEntity();
        entity.setMemoryId(UUID.randomUUID().toString());
        entity.setUserId(userId);
        entity.setTitle(request.title());
        entity.setDetails(request.details() != null ? request.details() : "");
        entity.setCategoryId(request.categoryId());
        entity.setSource(parseSource(request.source()));
        entity.setEnabled(request.enabled() != null ? request.enabled() : true);
        entity.setPinned(request.pinned() != null ? request.pinned() : false);
        entity.setConfidence(request.confidence());
        entity.setRiskLevel(parseRiskLevel(request.riskLevel()));
        entity.setStatus(parseStatus(request.status(), entity.getSource()));
        entity.setVersion(1);
        Instant now = Instant.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        entity.setLastUsedAt(now);
        entity.setUseCount(0);
        entity.setUsageReason(request.usageReason());
        entity.setSyncStatus(MemoryEntity.SyncStatus.PENDING);

        MemoryEntity saved = repository.save(entity);
        return toDto(saved);
    }

    /**
     * Update an existing memory by id, only if owned by the user.
     * Increments version on each update.
     * Immutable fields (id, createdAt, userId) cannot be changed via this method.
     * @throws ResourceNotFoundException if no memory with that id exists for the user
     */
    public MemoryDTO updateMemory(String id, String userId, MemoryRequestDTO request) {
        MemoryEntity entity = repository.findByMemoryIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Memory not found with id: " + id));

        entity.setTitle(request.title());
        entity.setDetails(request.details() != null ? request.details() : "");
        entity.setCategoryId(request.categoryId());
        entity.setSource(parseSource(request.source()));
        entity.setEnabled(request.enabled() != null ? request.enabled() : entity.getEnabled());
        entity.setPinned(request.pinned() != null ? request.pinned() : entity.getPinned());
        entity.setConfidence(request.confidence());
        entity.setRiskLevel(parseRiskLevel(request.riskLevel()));
        entity.setStatus(parseStatus(request.status(), entity.getSource()));
        entity.setUpdatedAt(Instant.now());
        entity.setUsageReason(request.usageReason());

        MemoryEntity saved = repository.save(entity);
        return toDto(saved);
    }

    /**
     * Delete a memory by id, only if owned by the user.
     * @throws ResourceNotFoundException if no memory with that id exists for the user
     */
    public void deleteMemory(String id, String userId) {
        if (!repository.existsByMemoryIdAndUserId(id, userId)) {
            throw new ResourceNotFoundException("Memory not found with id: " + id);
        }
        repository.deleteByMemoryIdAndUserId(id, userId);
    }

    /**
     * Mark a memory as active (approved), only if owned by the user.
     * @throws ResourceNotFoundException if no memory with that id exists for the user
     */
    public MemoryDTO approveMemory(String id, String userId) {
        MemoryEntity entity = repository.findByMemoryIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Memory not found with id: " + id));
        entity.setEnabled(true);
        entity.setUpdatedAt(Instant.now());
        return toDto(repository.save(entity));
    }

    /**
     * Mark a memory as disabled (rejected), only if owned by the user.
     * @throws ResourceNotFoundException if no memory with that id exists for the user
     */
    public MemoryDTO rejectMemory(String id, String userId) {
        MemoryEntity entity = repository.findByMemoryIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Memory not found with id: " + id));
        entity.setEnabled(false);
        entity.setUpdatedAt(Instant.now());
        return toDto(repository.save(entity));
    }

    /* ---------- Private helpers ---------- */

    private MemoryDTO toDto(MemoryEntity entity) {
        return new MemoryDTO(
                entity.getMemoryId(),
                entity.getTitle(),
                entity.getDetails(),
                entity.getCategoryId(),
                entity.getSource() != null ? entity.getSource().name() : null,
                entity.getEnabled(),
                entity.getPinned(),
                entity.getConfidence(),
                entity.getRiskLevel() != null ? entity.getRiskLevel().name() : null,
                entity.getStatus() != null ? entity.getStatus().name() : null,
                entity.getVersion(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getLastUsedAt(),
                entity.getUseCount(),
                entity.getUsageReason(),
                null, // tags not stored on MemoryEntity in this version
                entity.getSyncStatus() != null ? entity.getSyncStatus().name() : null
        );
    }

    private MemoryEntity.Source parseSource(String source) {
        if (source == null) return MemoryEntity.Source.USER_ADDED;
        try {
            return MemoryEntity.Source.valueOf(source);
        } catch (IllegalArgumentException e) {
            return MemoryEntity.Source.USER_ADDED;
        }
    }

    private MemoryEntity.RiskLevel parseRiskLevel(String riskLevel) {
        if (riskLevel == null) return MemoryEntity.RiskLevel.LOW;
        try {
            return MemoryEntity.RiskLevel.valueOf(riskLevel);
        } catch (IllegalArgumentException e) {
            return MemoryEntity.RiskLevel.LOW;
        }
    }

    private MemoryEntity.Status parseStatus(String status, MemoryEntity.Source source) {
        if (status != null) {
            try {
                return MemoryEntity.Status.valueOf(status);
            } catch (IllegalArgumentException e) {
                // fall through to default logic
            }
        }
        // AI_INFERRED memories start as PENDING_REVIEW unless explicitly set
        if (source == MemoryEntity.Source.AI_INFERRED) {
            return MemoryEntity.Status.PENDING_REVIEW;
        }
        return MemoryEntity.Status.ACTIVE;
    }
}
