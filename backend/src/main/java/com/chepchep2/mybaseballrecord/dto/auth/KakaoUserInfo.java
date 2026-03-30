package com.chepchep2.mybaseballrecord.dto.auth;

public record KakaoUserInfo(
        String subject,
        String nickname,
        String profileImageUrl,
        String email
) {
}
