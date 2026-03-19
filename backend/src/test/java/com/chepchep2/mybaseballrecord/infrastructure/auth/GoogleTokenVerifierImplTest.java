package com.chepchep2.mybaseballrecord.infrastructure.auth;

import com.chepchep2.mybaseballrecord.exception.auth.GoogleAuthFailedException;
import com.chepchep2.mybaseballrecord.exception.auth.InvalidGoogleTokenException;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenInfoClient;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GoogleTokenVerifierImplTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
            Instant.parse("2026-03-19T07:00:00Z"),
            ZoneOffset.UTC
    );

    @Test
    @DisplayName("토큰 정보가 유효하면 GoogleUserInfo를 반환한다")
    void verifySuccess() {
        GoogleTokenInfoClient client = idToken -> new GoogleTokenInfoClient.GoogleTokenInfo(
                "sub-1",
                "user@gmail.com",
                "조상우",
                "my-client-id",
                "1800000000"
        );

        GoogleTokenVerifier verifier = new GoogleTokenVerifierImpl(
                client,
                "my-client-id",
                FIXED_CLOCK
        );

        GoogleTokenVerifier.GoogleUserInfo result = verifier.verify("valid-token");
        assertThat(result.subject()).isEqualTo("sub-1");
        assertThat(result.email()).isEqualTo("user@gmail.com");
        assertThat(result.displayName()).isEqualTo("조상우");
    }

    @Test
    @DisplayName("aud가 다르면 InvalidGoogleTokenException")
    void verifyFailsWhenAudienceMismatch() {
        GoogleTokenInfoClient client = idToken -> new GoogleTokenInfoClient.GoogleTokenInfo(
                "sub-1",
                "user@gmail.com",
                "조상우",
                "other-client-id",
                "1800000000"
        );

        GoogleTokenVerifier verifier = new GoogleTokenVerifierImpl(
                client,
                "my-client-id",
                FIXED_CLOCK
        );

        assertThatThrownBy(() -> verifier.verify("valid-token"))
                .isInstanceOf(InvalidGoogleTokenException.class);
    }

    @Test
    @DisplayName("만료된 토큰이면 InvalidGoogleTokenException")
    void verifyFailsWhenExpired() {
        GoogleTokenInfoClient client = idToken -> new GoogleTokenInfoClient.GoogleTokenInfo(
                "sub-1",
                "user@gmail.com",
                "조상우",
                "my-client-id",
                "1700000000"
        );

        GoogleTokenVerifier verifier = new GoogleTokenVerifierImpl(
                client,
                "my-client-id",
                FIXED_CLOCK
        );

        assertThatThrownBy(() -> verifier.verify("expired-token"))
                .isInstanceOf(InvalidGoogleTokenException.class);
    }

    @Test
    @DisplayName("토큰 정보 조회 중 예외가 나면 GoogleAuthFailedException")
    void verifyFailsWhenClientThrowsUnexpectedException() {
        GoogleTokenInfoClient client = idToken -> {
            throw new RuntimeException("network down");
        };

        GoogleTokenVerifier verifier = new GoogleTokenVerifierImpl(
                client,
                "my-client-id",
                FIXED_CLOCK
        );

        assertThatThrownBy(() -> verifier.verify("token"))
                .isInstanceOf(GoogleAuthFailedException.class);
    }
}
