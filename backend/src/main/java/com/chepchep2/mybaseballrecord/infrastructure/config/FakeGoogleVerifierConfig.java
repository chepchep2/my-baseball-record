package com.chepchep2.mybaseballrecord.infrastructure.config;

import com.chepchep2.mybaseballrecord.exception.auth.GoogleAuthFailedException;
import com.chepchep2.mybaseballrecord.exception.auth.InvalidGoogleTokenException;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenVerifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("local-fake-google")
public class FakeGoogleVerifierConfig {

    @Bean
    public GoogleTokenVerifier fakeGoogleTokenVerifier() {
        return idToken -> {
            if (idToken == null || idToken.isBlank()) {
                throw new InvalidGoogleTokenException("idToken is blank.");
            }

            if ("fake-success-token".equals(idToken)) {
                return new GoogleTokenVerifier.GoogleUserInfo(
                        "fake-sub-1",
                        "fake-user@gmail.com",
                        "Fake User"
                );
            }

            if ("fake-auth-failed-token".equals(idToken)) {
                throw new GoogleAuthFailedException("Fake Google auth failed.");
            }

            throw new InvalidGoogleTokenException("Fake verifier rejected token.");
        };
    }
}
