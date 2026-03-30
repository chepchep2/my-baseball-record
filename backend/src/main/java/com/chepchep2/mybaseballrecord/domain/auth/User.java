package com.chepchep2.mybaseballrecord.domain.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "auth_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "google_subject", nullable = false, unique = true, length = 128)
    private String googleSubject;

    @Column(name = "email", nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "provider", nullable = false, length = 20)
    private String provider;

    private User(Long id, String googleSubject, String email, String displayName, String provider) {
        this.id = id;
        this.googleSubject = googleSubject;
        this.email = email;
        this.displayName = displayName;
        this.provider = provider;
    }

    public static User createNew(String googleSubject, String email, String displayName) {
        return new User(null, googleSubject, email, displayName, "GOOGLE");
    }

    public static User createNew(String subject, String email, String displayName, String provider) {
        return new User(null, subject, email, displayName, provider);
    }

    public static User existing(Long id, String googleSubject, String email, String displayName) {
        return new User(id, googleSubject, email, displayName, "GOOGLE");
    }

    public static User existing(Long id, String subject, String email, String displayName, String provider) {
        return new User(id, subject, email, displayName, provider);
    }

    protected User() {
        this.id = null;
        this.googleSubject = null;
        this.email = null;
        this.displayName = null;
        this.provider = null;
    }

    public void assignId(Long id) {
        this.id = id;
    }

    public Long id() {
        return id;
    }

    public String googleSubject() {
        return googleSubject;
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
}
