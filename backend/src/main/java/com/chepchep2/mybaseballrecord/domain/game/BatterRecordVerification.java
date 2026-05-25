package com.chepchep2.mybaseballrecord.domain.game;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Builder;

import java.time.Instant;

@Entity
@Table(name = "batter_record_verification")
public class BatterRecordVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batter_record_id", nullable = false)
    private Long batterRecordId;

    @Column(name = "verified_by_user_id", nullable = false)
    private Long verifiedByUserId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Builder
    public BatterRecordVerification(Long batterRecordId, Long verifiedByUserId) {
        this.batterRecordId = batterRecordId;
        this.verifiedByUserId = verifiedByUserId;
    }

    protected BatterRecordVerification() {
    }

    public Long batterRecordId() {
        return batterRecordId;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
