package com.memorylayer.backend.dto;

import java.time.Instant;
import java.util.List;

/**
 * Data Transfer Object for reading memories from the API.
 * This is the shape sent to the frontend — internal database fields
 * (like db_id) are intentionally excluded.
 */
public record MemoryDTO(
        String id,
        String title,
        String details,
        String categoryId,
        String source,
        Boolean enabled,
        Boolean pinned,
        Double confidence,
        String riskLevel,
        String status,
        Integer version,
        Instant createdAt,
        Instant updatedAt,
        Instant lastUsedAt,
        Integer useCount,
        String usageReason,
        List<String> tags,
        String syncStatus
) {
}
