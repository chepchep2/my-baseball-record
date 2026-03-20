package com.chepchep2.mybaseballrecord.dto.auth.response;

public record AuthTokenResponse(
        String accessToken,
        String refreshToken,
        String accessTokenExpiresAt,
        String refreshTokenExpiresAt,
        AuthUserResponse user
) {
    public record AuthUserResponse(
            long id,
            String displayName,
            String email,
            String provider
    ) {
    }
}
