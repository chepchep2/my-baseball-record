package com.chepchep2.mybaseballrecord.domain.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

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

    private User(Long id, String providerSubject, String email, String displayName, String provider, String profileImageUrl) {
        this.id = id;
        this.providerSubject = providerSubject;
        this.email = email;
        this.displayName = displayName;
        this.provider = provider;
        this.profileImageUrl = profileImageUrl;
    }

    public static User createNew(String googleSubject, String email, String displayName) {
        return new User(null, googleSubject, email, displayName, "GOOGLE", null);
    }

    public static User createNew(String subject, String email, String displayName, String provider) {
        return new User(null, subject, email, displayName, provider, null);
    }

    public static User createNew(String subject, String email, String displayName, String provider, String profileImageUrl) {
        return new User(null, subject, email, displayName, provider, profileImageUrl);
    }

    public static User existing(Long id, String googleSubject, String email, String displayName) {
        return new User(id, googleSubject, email, displayName, "GOOGLE", null);
    }

    public static User existing(Long id, String subject, String email, String displayName, String provider) {
        return new User(id, subject, email, displayName, provider, null);
    }

    public static User existing(Long id, String subject, String email, String displayName, String provider, String profileImageUrl) {
        return new User(id, subject, email, displayName, provider, profileImageUrl);
    }

    protected User() {
        this.id = null;
        this.providerSubject = null;
        this.email = null;
        this.displayName = null;
        this.provider = null;
        this.profileImageUrl = null;
    }

    public void assignId(Long id) {
        this.id = id;
    }

    public void updateProfile(String email, String displayName, String profileImageUrl) {
        this.email = email;
        this.displayName = displayName;
        this.profileImageUrl = profileImageUrl;
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
}
