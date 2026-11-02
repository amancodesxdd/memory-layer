package com.memorylayer.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.Objects;

/**
 * JPA entity representing a memory stored in PostgreSQL.
 * Maps the frontend memory model to a relational database table.
 */
@Entity
@Table(name = "memories")
public class MemoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "db_id")
    private Long dbId;

    @Column(name = "memory_id", nullable = false, unique = true)
    private String memoryId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserEntity user;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "category_id")
    private String categoryId;

    @Column(name = "source", nullable = false)
    @Enumerated(EnumType.STRING)
    private Source source;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled;

    @Column(name = "pinned", nullable = false)
    private Boolean pinned;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "risk_level", nullable = false)
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "version", nullable = false)
    @Version
    private Integer version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "use_count")
    private Integer useCount;

    @Column(name = "usage_reason", columnDefinition = "TEXT")
    private String usageReason;

    @Column(name = "sync_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private SyncStatus syncStatus;

    public MemoryEntity() {
    }

    public MemoryEntity(String memoryId, String userId, String title, String details, String categoryId,
                        Source source, Boolean enabled, Boolean pinned, Double confidence,
                        RiskLevel riskLevel, Status status, Integer version,
                        Instant createdAt, Instant updatedAt, Instant lastUsedAt,
                        Integer useCount, String usageReason, SyncStatus syncStatus) {
        this.memoryId = memoryId;
        this.userId = userId;
        this.title = title;
        this.details = details;
        this.categoryId = categoryId;
        this.source = source;
        this.enabled = enabled;
        this.pinned = pinned;
        this.confidence = confidence;
        this.riskLevel = riskLevel;
        this.status = status;
        this.version = version;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastUsedAt = lastUsedAt;
        this.useCount = useCount;
        this.usageReason = usageReason;
        this.syncStatus = syncStatus;
    }

    public Long getDbId() {
        return dbId;
    }

    public void setDbId(Long dbId) {
        this.dbId = dbId;
    }

    public String getMemoryId() {
        return memoryId;
    }

    public void setMemoryId(String memoryId) {
        this.memoryId = memoryId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(Instant lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public Integer getUseCount() {
        return useCount;
    }

    public void setUseCount(Integer useCount) {
        this.useCount = useCount;
    }

    public String getUsageReason() {
        return usageReason;
    }

    public void setUsageReason(String usageReason) {
        this.usageReason = usageReason;
    }

    public SyncStatus getSyncStatus() {
        return syncStatus;
    }

    public void setSyncStatus(SyncStatus syncStatus) {
        this.syncStatus = syncStatus;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MemoryEntity that = (MemoryEntity) o;
        return Objects.equals(memoryId, that.memoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(memoryId);
    }

    public enum Source {
        USER_ADDED, AI_INFERRED, IMPORT
    }

    public enum RiskLevel {
        LOW, MEDIUM, HIGH
    }

    public enum Status {
        ACTIVE, PENDING_REVIEW, REJECTED
    }

    public enum SyncStatus {
        LOCAL_ONLY, PENDING, SYNCED, ERROR
    }
}
