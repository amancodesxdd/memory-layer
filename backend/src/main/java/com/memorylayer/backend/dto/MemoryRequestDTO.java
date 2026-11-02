package com.memorylayer.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Data Transfer Object for creating or updating a memory via the API.
 * Used for both POST and PUT request bodies.
 */
public record MemoryRequestDTO(
        @NotBlank(message = "title is required")
        String title,
        String details,
        String categoryId,
        String source,
        Boolean enabled,
        Boolean pinned,
        Double confidence,
        String riskLevel,
        String status,
        List<String> tags,
        String usageReason
) {
}
