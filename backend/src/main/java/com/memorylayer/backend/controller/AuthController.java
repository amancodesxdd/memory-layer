package com.memorylayer.backend.controller;

import com.memorylayer.backend.dto.AuthRequestDTO;
import com.memorylayer.backend.dto.AuthResponseDTO;
import com.memorylayer.backend.dto.UserDTO;
import com.memorylayer.backend.service.AuthService;
import com.memorylayer.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Instant;

/**
 * REST controller for authentication with HttpOnly cookie-based JWT storage.
 * Endpoints:
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   GET    /api/auth/me
 *   POST   /api/auth/logout
 *   POST   /api/auth/refresh
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ACCESS_COOKIE = "ACCESS_TOKEN";
    private static final String REFRESH_COOKIE = "REFRESH_TOKEN";

    private final AuthService authService;
    private final JwtService jwtService;
    private final boolean cookieSecure;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            @Value("${app.cookie.secure:true}") boolean cookieSecure
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody AuthRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return buildAuthResponse(HttpStatus.CREATED, response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return buildAuthResponse(HttpStatus.OK, response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(HttpServletRequest request) {
        String refreshToken = resolveToken(request, REFRESH_COOKIE);
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthResponseDTO response = authService.refresh(refreshToken);
        return buildAuthResponse(HttpStatus.OK, response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String jwt = resolveToken(request, ACCESS_COOKIE);
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = jwtService.extractUserId(jwt);

        return ResponseEntity.ok(authService.getUser(userId));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request
    ) {
        // Revoke the access token if present
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            String jti = jwtService.extractTokenJti(jwt);
            Instant expiresAt = jwtService.extractExpiration(jwt).toInstant();
            authService.revokeAccessToken(jti, expiresAt);
        }

        // Clear cookies
        ResponseCookie accessCookie = ResponseCookie.from("ACCESS_TOKEN", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", accessCookie.toString())
                .header("Set-Cookie", refreshCookie.toString())
                .build();
    }

    private ResponseEntity.BodyBuilder setAuthCookies(ResponseEntity.BodyBuilder builder, AuthResponseDTO response) {
        ResponseCookie accessCookie = ResponseCookie.from("ACCESS_TOKEN", response.accessToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(900)
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", response.refreshToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(604800)
                .build();

        return builder
                .header("Add-Set-Cookie", accessCookie.toString())
                .header("Add-Set-Cookie", refreshCookie.toString());
    }

    private ResponseEntity<AuthResponseDTO> buildAuthResponse(HttpStatus status, AuthResponseDTO response) {
        return setAuthCookies(ResponseEntity.status(status), response)
                .body(response);
    }
}
