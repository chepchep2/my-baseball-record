package com.chepchep2.mybaseballrecord.infrastructure.auth;

import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.service.auth.RefreshTokenValidator;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Date;

public class JwtRefreshTokenValidator implements RefreshTokenValidator {
    private final SecretKey secretKey;
    private final Clock clock;

    public JwtRefreshTokenValidator(String secret, Clock clock) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.clock = clock;
    }

    @Override
    public long validateAndGetUserId(String refreshToken) {
        try {
            Claims claims = Jwts.parser()
                    .clock(() -> Date.from(clock.instant()))
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();

            String tokenType = claims.get("tokenType", String.class);
            if (!"refresh".equals(tokenType)) {
                throw new RefreshTokenInvalidException("refresh token type is invalid.");
            }

            String subject = claims.getSubject();
            if (subject == null || subject.isBlank()) {
                throw new RefreshTokenInvalidException("refresh token subject is missing.");
            }

            try {
                return Long.parseLong(subject);
            } catch (NumberFormatException e) {
                throw new RefreshTokenInvalidException("refresh token subject is invalid.");
            }
        } catch (ExpiredJwtException e) {
            throw new RefreshTokenExpiredException("refresh token is expired.");
        } catch (RefreshTokenInvalidException e) {
            throw e;
        } catch (JwtException e) {
            throw new RefreshTokenInvalidException("refresh token signature is invalid.");
        }
    }
}
