package com.chepchep2.mybaseballrecord.infrastructure.auth;

import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtRefreshTokenValidatorTest {

    private static final String SECRET = "01234567890123456789012345678901";

    @Test
    @DisplayName("유효한 refresh token이면 userId를 반환한다")
    void validateAndGetUserIdSuccess() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-03-19T07:00:00Z"), ZoneOffset.UTC);
        JwtTokenIssuerImpl issuer = new JwtTokenIssuerImpl(SECRET, 3600, 2592000, fixedClock);
        JwtRefreshTokenValidator validator = new JwtRefreshTokenValidator(SECRET, fixedClock);

        String refreshToken = issuer.issueRefreshToken(7L).token();
        long userId = validator.validateAndGetUserId(refreshToken);

        assertThat(userId).isEqualTo(7L);
    }

    @Test
    @DisplayName("access token이면 RefreshTokenInvalidException")
    void validateFailsWhenTokenTypeIsAccess() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-03-19T07:00:00Z"), ZoneOffset.UTC);
        JwtTokenIssuerImpl issuer = new JwtTokenIssuerImpl(SECRET, 3600, 2592000, fixedClock);
        JwtRefreshTokenValidator validator = new JwtRefreshTokenValidator(SECRET, fixedClock);

        String accessToken = issuer.issueAccessToken(7L).token();

        assertThatThrownBy(() -> validator.validateAndGetUserId(accessToken))
                .isInstanceOf(RefreshTokenInvalidException.class);
    }

    @Test
    @DisplayName("만료된 refresh token이면 RefreshTokenExpiredException")
    void validateFailsWhenExpired() {
        Clock issuedClock = Clock.fixed(Instant.parse("2020-01-01T00:00:00Z"), ZoneOffset.UTC);
        Clock validateClock = Clock.fixed(Instant.parse("2026-03-19T07:00:00Z"), ZoneOffset.UTC);
        JwtTokenIssuerImpl issuer = new JwtTokenIssuerImpl(SECRET, 3600, 1, issuedClock);
        JwtRefreshTokenValidator validator = new JwtRefreshTokenValidator(SECRET, validateClock);

        String expiredRefreshToken = issuer.issueRefreshToken(7L).token();

        assertThatThrownBy(() -> validator.validateAndGetUserId(expiredRefreshToken))
                .isInstanceOf(RefreshTokenExpiredException.class);
    }

    @Test
    @DisplayName("서명이 다른 refresh token이면 RefreshTokenInvalidException")
    void validateFailsWhenSignatureInvalid() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-03-19T07:00:00Z"), ZoneOffset.UTC);
        JwtTokenIssuerImpl issuer = new JwtTokenIssuerImpl(SECRET, 3600, 2592000, fixedClock);
        JwtRefreshTokenValidator validator = new JwtRefreshTokenValidator(
                "abcdefghijklmnopqrstuvwxyz123456",
                fixedClock
        );

        String refreshToken = issuer.issueRefreshToken(7L).token();

        assertThatThrownBy(() -> validator.validateAndGetUserId(refreshToken))
                .isInstanceOf(RefreshTokenInvalidException.class);
    }
}
