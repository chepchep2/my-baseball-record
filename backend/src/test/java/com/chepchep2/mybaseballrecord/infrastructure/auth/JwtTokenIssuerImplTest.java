package com.chepchep2.mybaseballrecord.infrastructure.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.chepchep2.mybaseballrecord.service.auth.JwtTokenIssuer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenIssuerImplTest {

    private static final String SECRET = "01234567890123456789012345678901";
    private static final Clock FIXED_CLOCK = Clock.fixed(
            Instant.parse("2026-03-19T07:00:00Z"),
            ZoneOffset.UTC
    );

    @Test
    @DisplayName("access token을 발급하면 subject=userId, tokenType=access 클레임을 가진다")
    void issueAccessToken() {
        JwtTokenIssuer issuer = new JwtTokenIssuerImpl(
                SECRET,
                3600,
                2592000,
                FIXED_CLOCK
        );

        JwtTokenIssuer.IssuedToken issued = issuer.issueAccessToken(7L);
        Claims claims = parse(issued.token());

        assertThat(claims.getSubject()).isEqualTo("7");
        assertThat(claims.get("tokenType", String.class)).isEqualTo("access");
        assertThat(issued.expiresAt()).isEqualTo(Instant.parse("2026-03-19T08:00:00Z"));
    }

    @Test
    @DisplayName("refresh token을 발급하면 subject=userId, tokenType=refresh 클레임을 가진다")
    void issueRefreshToken() {
        JwtTokenIssuer issuer = new JwtTokenIssuerImpl(
                SECRET,
                3600,
                2592000,
                FIXED_CLOCK
        );

        JwtTokenIssuer.IssuedToken issued = issuer.issueRefreshToken(11L);
        Claims claims = parse(issued.token());

        assertThat(claims.getSubject()).isEqualTo("11");
        assertThat(claims.get("tokenType", String.class)).isEqualTo("refresh");
        assertThat(issued.expiresAt()).isEqualTo(Instant.parse("2026-04-18T07:00:00Z"));
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .clock(() -> Date.from(FIXED_CLOCK.instant()))
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
