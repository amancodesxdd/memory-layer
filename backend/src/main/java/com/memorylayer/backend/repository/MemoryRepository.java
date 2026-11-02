package com.memorylayer.backend.repository;

import com.memorylayer.backend.entity.MemoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for MemoryEntity.
 * Provides CRUD operations plus custom queries for search, filter, and user-scoped access.
 */
@Repository
public interface MemoryRepository extends JpaRepository<MemoryEntity, Long> {

    Optional<MemoryEntity> findByMemoryId(String memoryId);

    Optional<MemoryEntity> findByMemoryIdAndUserId(String memoryId, String userId);

    boolean existsByMemoryId(String memoryId);

    boolean existsByMemoryIdAndUserId(String memoryId, String userId);

    void deleteByMemoryIdAndUserId(String memoryId, String userId);

    List<MemoryEntity> findByUserId(String userId);

    List<MemoryEntity> findByUserIdAndSource(String userId, com.memorylayer.backend.entity.MemoryEntity.Source source);

    List<MemoryEntity> findByUserIdAndRiskLevel(String userId, com.memorylayer.backend.entity.MemoryEntity.RiskLevel riskLevel);

    List<MemoryEntity> findByUserIdAndStatus(String userId, com.memorylayer.backend.entity.MemoryEntity.Status status);

    List<MemoryEntity> findByUserIdAndEnabled(String userId, boolean enabled);

    List<MemoryEntity> findByUserIdAndPinned(String userId, boolean pinned);

    List<MemoryEntity> findByUserIdAndCategoryId(String userId, String categoryId);
}
