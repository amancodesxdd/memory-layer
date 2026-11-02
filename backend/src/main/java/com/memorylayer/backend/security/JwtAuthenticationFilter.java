package com.memorylayer.backend.security;

import com.memorylayer.backend.entity.RevokedToken;
import com.memorylayer.backend.repository.RevokedTokenRepository;
import com.memorylayer.backend.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filter that extracts the JWT from the Authorization header,
 * validates it, checks revocation, and sets the Spring Security context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final RevokedTokenRepository revokedTokenRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            RevokedTokenRepository revokedTokenRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Try Authorization header first, then fall back to ACCESS_TOKEN cookie
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            String cookieHeader = request.getHeader("Cookie");
            jwt = extractTokenFromCookie(cookieHeader, "ACCESS_TOKEN");
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            String tokenType = jwtService.extractTokenType(jwt);
            String jti = jwtService.extractTokenJti(jwt);
            boolean isRevoked = revokedTokenRepository.findByJti(jti).isPresent();

            if ("access".equals(tokenType)
                    && !isRevoked
                    && jwtService.isAccessTokenValid(jwt, userDetails, true)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(String cookieHeader, String cookieName) {
        if (cookieHeader == null) return null;
        String[] cookies = cookieHeader.split(";");
        for (String cookie : cookies) {
            String[] parts = cookie.trim().split("=", 2);
            if (parts.length == 2 && parts[0].equals(cookieName)) {
                return parts[1];
            }
        }
        return null;
    }
}
