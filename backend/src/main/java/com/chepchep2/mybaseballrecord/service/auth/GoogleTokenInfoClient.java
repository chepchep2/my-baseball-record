package com.chepchep2.mybaseballrecord.service.auth;

public interface GoogleTokenInfoClient {

    GoogleTokenInfo fetch(String idToken);

    record GoogleTokenInfo(
            String subject,
            String email,
            String name,
            String audience,
            String expiresAtEpochSeconds
    ) {
    }
}
