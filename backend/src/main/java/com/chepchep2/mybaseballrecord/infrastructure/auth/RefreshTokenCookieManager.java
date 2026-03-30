package com.chepchep2.mybaseballrecord.infrastructure.auth;

import org.springframework.http.ResponseCookie;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

public class RefreshTokenCookieManager {
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String REFRESH_TOKEN_COOKIE_PATH = "/api/auth";

    private final Clock clock;
    private final boolean secure;
    private final String sameSite;
    private final String domain;

    public RefreshTokenCookieManager(Clock clock, boolean secure, String sameSite, String domain) {
        this.clock = clock;
        this.secure = secure;
        this.sameSite = sameSite;
        this.domain = domain;
    }

    public ResponseCookie createRefreshTokenCookie(String refreshToken, Instant expiresAt) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(REFRESH_TOKEN_COOKIE_PATH)
                .maxAge(resolveMaxAge(expiresAt));

        if (domain != null && !domain.isBlank()) {
            builder.domain(domain);
        }

        return builder.build();
    }

    public ResponseCookie clearRefreshTokenCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(REFRESH_TOKEN_COOKIE_PATH)
                .maxAge(Duration.ZERO);

        if (domain != null && !domain.isBlank()) {
            builder.domain(domain);
        }

        return builder.build();
    }

    private Duration resolveMaxAge(Instant expiresAt) {
        long seconds = Math.max(0, Duration.between(clock.instant(), expiresAt).toSeconds());
        return Duration.ofSeconds(seconds);
    }
}
