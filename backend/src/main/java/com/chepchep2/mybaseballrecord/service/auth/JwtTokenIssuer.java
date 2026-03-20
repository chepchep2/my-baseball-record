package com.chepchep2.mybaseballrecord.service.auth;

import java.time.Instant;

public interface JwtTokenIssuer {

    IssuedToken issueAccessToken(long userId);

    IssuedToken issueRefreshToken(long userId);

    record IssuedToken(
            String token,
            Instant expiresAt
    ) {
    }
}
