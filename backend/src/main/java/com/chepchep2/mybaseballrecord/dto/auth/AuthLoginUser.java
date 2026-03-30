package com.chepchep2.mybaseballrecord.dto.auth;

public record AuthLoginUser(
        long id,
        String displayName,
        String email,
        String provider,
        String profileImageUrl
) {
}
