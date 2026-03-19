package com.chepchep2.mybaseballrecord.dto.auth;

import java.time.Instant;

public record AuthLoginResult(
        String accessToken,
        String refreshToken,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt,
        AuthLoginUser user
) {
}
