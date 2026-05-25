package com.chepchep2.mybaseballrecord.domain.game;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Builder;

import java.time.Instant;

@Entity
@Table(name = "stadium")
public class Stadium {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "city_name", nullable = false, length = 100)
    private String cityName;

    @Column(name = "district_name", nullable = false, length = 100)
    private String districtName;

    @Column(name = "stadium_name", nullable = false, length = 150)
    private String stadiumName;

    @Column(name = "normalized_name", nullable = false, length = 200)
    private String normalizedName;

    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Builder
    public Stadium(
            String cityName,
            String districtName,
            String stadiumName,
            String normalizedName,
            Long createdByUserId
    ) {
        this.cityName = cityName;
        this.districtName = districtName;
        this.stadiumName = stadiumName;
        this.normalizedName = normalizedName;
        this.createdByUserId = createdByUserId;
    }

    protected Stadium() {
    }

    public Long id() {
        return id;
    }

    public String stadiumName() {
        return stadiumName;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
