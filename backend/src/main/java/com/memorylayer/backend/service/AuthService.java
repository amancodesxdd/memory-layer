package com.memorylayer.backend.service;

import com.memorylayer.backend.dto.AuthRequestDTO;
import com.memorylayer.backend.dto.AuthResponseDTO;
import com.memorylayer.backend.dto.UserDTO;
import com.memorylayer.backend.entity.RevokedToken;
import com.memorylayer.backend.entity.UserEntity;
import com.memorylayer.backend.repository.RevokedTokenRepository;
import com.memorylayer.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Service for authentication operations: registration, login, refresh, and logout.
 */
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RevokedTokenRepository revokedTokenRepository;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            RevokedTokenRepository revokedTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    /**
     * Register a new user. Returns access and refresh tokens.
     * @throws IllegalArgumentException if email already exists or validation fails
     */
    public AuthResponseDTO register(AuthRequestDTO request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered: " + normalizedEmail);
        }

        UserEntity user = new UserEntity();
        user.setUserId(java.util.UUID.randomUUID().toString());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password("")
                .roles("USER")
                .build();

        String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
        String refreshToken = jwtService.generateRefreshToken(userDetails, user.getUserId());

        return new AuthResponseDTO(user.getUserId(), user.getEmail(), accessToken, refreshToken, "Bearer");
    }

    /**
     * Authenticate a user and return access and refresh tokens.
     * @throws BadCredentialsException if credentials are invalid
     */
    public AuthResponseDTO login(AuthRequestDTO request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + normalizedEmail));

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password("")
                .roles("USER")
                .build();

        String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
        String refreshToken = jwtService.generateRefreshToken(userDetails, user.getUserId());

        return new AuthResponseDTO(user.getUserId(), user.getEmail(), accessToken, refreshToken, "Bearer");
    }

    /**
     * Refresh an access token using a valid refresh token.
     * @throws IllegalArgumentException if refresh token is invalid
     */
    public AuthResponseDTO refresh(String refreshToken) {
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String userId = jwtService.extractUserId(refreshToken);
        String email = jwtService.extractUsername(refreshToken);

        UserEntity user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password("")
                .roles("USER")
                .build();

        String newAccessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
        String newRefreshToken = jwtService.generateRefreshToken(userDetails, user.getUserId());

        return new AuthResponseDTO(user.getUserId(), user.getEmail(), newAccessToken, newRefreshToken, "Bearer");
    }

    /**
     * Revoke the given access token JTI so it can no longer be used.
     */
    public void revokeAccessToken(String jti, Instant expiresAt) {
        if (revokedTokenRepository.findByJti(jti).isEmpty()) {
            revokedTokenRepository.save(new RevokedToken(jti, expiresAt));
        }
    }

    /**
     * Get current user DTO from userId.
     */
    public UserDTO getUser(String userId) {
        UserEntity user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));
        return new UserDTO(user.getUserId(), user.getEmail());
    }

    /**
     * Get current user DTO from email (used by @AuthenticationPrincipal which provides email).
     */
    public UserDTO getUserByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return new UserDTO(user.getUserId(), user.getEmail());
    }
}
