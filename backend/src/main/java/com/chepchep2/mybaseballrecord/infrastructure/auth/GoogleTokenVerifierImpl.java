package com.chepchep2.mybaseballrecord.infrastructure.auth;

import com.chepchep2.mybaseballrecord.exception.auth.GoogleAuthFailedException;
import com.chepchep2.mybaseballrecord.exception.auth.InvalidGoogleTokenException;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenInfoClient;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenVerifier;

import java.time.Clock;
import java.time.Instant;

public class GoogleTokenVerifierImpl implements GoogleTokenVerifier {
    private final GoogleTokenInfoClient tokenInfoClient;
    private final String googleClientId;
    private final Clock clock;

    public GoogleTokenVerifierImpl(
            GoogleTokenInfoClient tokenInfoClient,
            String googleClientId,
            Clock clock
    ) {
        this.tokenInfoClient = tokenInfoClient;
        this.googleClientId = googleClientId;
        this.clock = clock;
    }

    @Override
    public GoogleUserInfo verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new InvalidGoogleTokenException("idToken is blank.");
        }

        GoogleTokenInfoClient.GoogleTokenInfo tokenInfo;
        try {
            tokenInfo = tokenInfoClient.fetch(idToken);
        } catch (InvalidGoogleTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new GoogleAuthFailedException("Google token verification failed.");
        }

        validateAudience(tokenInfo.audience());
        validateExpiry(tokenInfo.expiresAtEpochSeconds());
        validateSubjectAndEmail(tokenInfo.subject(), tokenInfo.email());

        String displayName = tokenInfo.name() == null || tokenInfo.name().isBlank()
                ? tokenInfo.email()
                : tokenInfo.name();

        return new GoogleUserInfo(
                tokenInfo.subject(),
                tokenInfo.email(),
                displayName
        );
    }

    private void validateAudience(String audience) {
        if (audience == null || !audience.equals(googleClientId)) {
            throw new InvalidGoogleTokenException("Google token audience does not match client id.");
        }
    }

    private void validateExpiry(String expString) {
        if (expString == null || expString.isBlank()) {
            throw new InvalidGoogleTokenException("Google token is missing expiration.");
        }

        long expSeconds;
        try {
            expSeconds = Long.parseLong(expString);
        } catch (NumberFormatException e) {
            throw new InvalidGoogleTokenException("Google token expiration is invalid.");
        }

        if (Instant.ofEpochSecond(expSeconds).isBefore(clock.instant())) {
            throw new InvalidGoogleTokenException("Google token is expired.");
        }
    }

    private void validateSubjectAndEmail(String subject, String email) {
        if (subject == null || subject.isBlank()) {
            throw new InvalidGoogleTokenException("Google token subject is missing.");
        }
        if (email == null || email.isBlank()) {
            throw new InvalidGoogleTokenException("Google token email is missing.");
        }
    }
}
