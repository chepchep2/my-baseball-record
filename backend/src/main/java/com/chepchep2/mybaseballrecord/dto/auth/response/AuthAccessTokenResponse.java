package com.chepchep2.mybaseballrecord.dto.auth.response;

public record AuthAccessTokenResponse(
        String accessToken,
        long expiresIn
) {
}
