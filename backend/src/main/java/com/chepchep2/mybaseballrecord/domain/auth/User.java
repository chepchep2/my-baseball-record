package com.chepchep2.mybaseballrecord.domain.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "auth_user",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_auth_user_provider_subject", columnNames = {"provider", "provider_subject"})
        }
)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_subject", nullable = false, length = 128)
    private String providerSubject;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "provider", nullable = false, length = 20)
    private String provider;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    private User(
            Long id,
            String providerSubject,
            String email,
            String displayName,
            String provider,
            String profileImageUrl,
            Instant createdAt,
            Instant updatedAt,
            Instant lastLoginAt
    ) {
        this.id = id;
        this.providerSubject = providerSubject;
        this.email = email;
        this.displayName = displayName;
        this.provider = provider;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
    }

    public static User createNew(String subject, String email, String displayName, String provider, String profileImageUrl) {
        return new User(null, subject, email, displayName, provider, profileImageUrl, null, null, null);
    }

    public static User existing(Long id, String subject, String email, String displayName, String provider, String profileImageUrl) {
        return new User(id, subject, email, displayName, provider, profileImageUrl, null, null, null);
    }

    public static User existing(
            Long id,
            String subject,
            String email,
            String displayName,
            String provider,
            String profileImageUrl,
            Instant createdAt,
            Instant updatedAt,
            Instant lastLoginAt
    ) {
        return new User(id, subject, email, displayName, provider, profileImageUrl, createdAt, updatedAt, lastLoginAt);
    }

    protected User() {
        this.id = null;
        this.providerSubject = null;
        this.email = null;
        this.displayName = null;
        this.provider = null;
        this.profileImageUrl = null;
        this.createdAt = null;
        this.updatedAt = null;
        this.lastLoginAt = null;
    }

    public void assignId(Long id) {
        this.id = id;
    }

    public void updateProfile(String email, String displayName, String profileImageUrl) {
        this.email = email;
        this.displayName = displayName;
        this.profileImageUrl = profileImageUrl;
    }

    public void markLoggedIn(Instant now) {
        this.lastLoginAt = now;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = this.createdAt;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long id() {
        return id;
    }

    public String providerSubject() {
        return providerSubject;
    }

    public String email() {
        return email;
    }

    public String displayName() {
        return displayName;
    }

    public String provider() {
        return provider;
    }

    public String profileImageUrl() {
        return profileImageUrl;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Instant updatedAt() {
        return updatedAt;
    }

    public Instant lastLoginAt() {
        return lastLoginAt;
    }
}
