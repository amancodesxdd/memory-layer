package com.memorylayer.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/**
 * Service for JWT token creation and validation.
 * Supports short-lived access tokens and long-lived refresh tokens with JTI claims for revocation.
 */
@Service
public class JwtService {

    @Value("${jwt.secret:change-me-in-production-min-32-chars}")
    private String secret;

    @Value("${jwt.access-expiration-ms:900000}")
    private long accessExpirationMs; // 15 minutes default

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs; // 7 days default

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generate a short-lived access token for the given user.
     */
    public String generateAccessToken(UserDetails userDetails, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("type", "access");
        claims.put("jti", UUID.randomUUID().toString());
        return createToken(claims, userDetails.getUsername(), accessExpirationMs);
    }

    /**
     * Generate a long-lived refresh token for the given user.
     */
    public String generateRefreshToken(UserDetails userDetails, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("type", "refresh");
        claims.put("jti", UUID.randomUUID().toString());
        return createToken(claims, userDetails.getUsername(), refreshExpirationMs);
    }

    private String createToken(Map<String, Object> extraClaims, String subject, long expirationMs) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validate an access token against user details and revocation status.
     */
    public boolean isAccessTokenValid(String token, UserDetails userDetails, boolean revocationChecked) {
        if (!revocationChecked) {
            return false;
        }
        final String username = extractUsername(token);
        return "access".equals(extractClaim(token, claims -> claims.get("type", String.class)))
                && username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    /**
     * Validate a refresh token (no revocation check needed; refresh tokens are single-use per issue).
     */
    public boolean isRefreshTokenValid(String token) {
        try {
            return "refresh".equals(extractClaim(token, claims -> claims.get("type", String.class)))
                    && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public String extractTokenJti(String token) {
        return extractClaim(token, Claims::getId);
    }
}
