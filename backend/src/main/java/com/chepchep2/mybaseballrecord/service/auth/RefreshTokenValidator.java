package com.chepchep2.mybaseballrecord.service.auth;

public interface RefreshTokenValidator {
    long validateAndGetUserId(String refreshToken);
}
