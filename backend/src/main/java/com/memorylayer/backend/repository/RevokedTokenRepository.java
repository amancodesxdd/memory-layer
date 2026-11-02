package com.memorylayer.backend.repository;

import com.memorylayer.backend.entity.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for revoked JWT access tokens (token blacklist).
 */
@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {

    Optional<RevokedToken> findByJti(String jti);
}
