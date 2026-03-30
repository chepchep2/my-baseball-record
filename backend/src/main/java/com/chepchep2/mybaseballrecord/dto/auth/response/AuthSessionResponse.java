package com.chepchep2.mybaseballrecord.dto.auth.response;

public record AuthSessionResponse(
        String accessToken,
        long expiresIn,
        AuthSessionUserResponse user
) {
    public record AuthSessionUserResponse(
            long id,
            String nickname,
            String profileImageUrl
    ) {
    }
}
