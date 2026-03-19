package com.chepchep2.mybaseballrecord.infrastructure.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.chepchep2.mybaseballrecord.service.auth.JwtTokenIssuer;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public class JwtTokenIssuerImpl implements JwtTokenIssuer {
    private final SecretKey secretKey;
    private final long accessTokenTtlSeconds;
    private final long refreshTokenTtlSeconds;
    private final Clock clock;

    public JwtTokenIssuerImpl(
            String secret,
            long accessTokenTtlSeconds,
            long refreshTokenTtlSeconds,
            Clock clock
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtlSeconds = accessTokenTtlSeconds;
        this.refreshTokenTtlSeconds = refreshTokenTtlSeconds;
        this.clock = clock;
    }

    @Override
    public IssuedToken issueAccessToken(long userId) {
        return issue(userId, "access", accessTokenTtlSeconds);
    }

    @Override
    public IssuedToken issueRefreshToken(long userId) {
        return issue(userId, "refresh", refreshTokenTtlSeconds);
    }

    private IssuedToken issue(long userId, String tokenType, long ttlSeconds) {
        Instant now = clock.instant();
        Instant expiresAt = now.plus(ttlSeconds, ChronoUnit.SECONDS);

        String token = Jwts.builder()
                .subject(Long.toString(userId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .claim("tokenType", tokenType)
                .signWith(secretKey)
                .compact();

        return new IssuedToken(token, expiresAt);
    }
}
