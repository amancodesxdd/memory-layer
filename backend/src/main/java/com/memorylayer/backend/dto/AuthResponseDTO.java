package com.memorylayer.backend.dto;

/**
 * Response DTO for successful authentication.
 * Never includes password or password hash.
 */
public record AuthResponseDTO(
        String userId,
        String email,
        String accessToken,
        String refreshToken,
        String tokenType
) {
}
