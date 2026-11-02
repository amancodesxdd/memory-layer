package com.memorylayer.backend.dto;

import java.time.Instant;

/**
 * Standard error response returned by the API when something goes wrong.
 * Never exposes stack traces or internal database details to the client.
 */
public record ErrorResponseDTO(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
