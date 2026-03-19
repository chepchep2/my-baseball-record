package com.chepchep2.mybaseballrecord.service.auth;

public interface GoogleTokenVerifier {

    GoogleUserInfo verify(String idToken);

    record GoogleUserInfo(
            String subject,
            String email,
            String displayName
    ) {
    }
}
