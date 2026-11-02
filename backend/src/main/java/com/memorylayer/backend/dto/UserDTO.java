package com.memorylayer.backend.dto;

/**
 * Data Transfer Object for the current authenticated user.
 * Safe public information only — no password or hash.
 */
public record UserDTO(
        String userId,
        String email
) {
}
