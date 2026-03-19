package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginUser;
import com.chepchep2.mybaseballrecord.domain.auth.RefreshToken;
import com.chepchep2.mybaseballrecord.domain.auth.User;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenRevokedException;
import com.chepchep2.mybaseballrecord.repository.auth.RefreshTokenRepository;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;

import java.time.Clock;
import java.time.Instant;

public class AuthService {
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtTokenIssuer jwtTokenIssuer;
    private final RefreshTokenValidator refreshTokenValidator;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;

    public AuthService(
            GoogleTokenVerifier googleTokenVerifier,
            JwtTokenIssuer jwtTokenIssuer,
            RefreshTokenValidator refreshTokenValidator,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            Clock clock
    ) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.jwtTokenIssuer = jwtTokenIssuer;
        this.refreshTokenValidator = refreshTokenValidator;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.clock = clock;
    }

    public AuthLoginResult loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleUserInfo googleUserInfo = googleTokenVerifier.verify(idToken);
        User user = userRepository.findByEmail(googleUserInfo.email())
                .orElseGet(() -> userRepository.save(
                        User.createNew(
                                googleUserInfo.subject(),
                                googleUserInfo.email(),
                                googleUserInfo.displayName()
                        )
                ));

        JwtTokenIssuer.IssuedToken accessToken = jwtTokenIssuer.issueAccessToken(user.id());
        JwtTokenIssuer.IssuedToken refreshToken = jwtTokenIssuer.issueRefreshToken(user.id());
        refreshTokenRepository.save(new RefreshToken(user.id(), refreshToken.token(), refreshToken.expiresAt()));

        return new AuthLoginResult(
                accessToken.token(),
                refreshToken.token(),
                accessToken.expiresAt(),
                refreshToken.expiresAt(),
                new AuthLoginUser(
                        user.id(),
                        user.displayName(),
                        user.email(),
                        user.provider()
                )
        );
    }

    public AuthLoginResult refreshSession(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RefreshTokenInvalidException("refresh token is blank.");
        }
        long userIdFromToken = refreshTokenValidator.validateAndGetUserId(refreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RefreshTokenRevokedException("refresh token is revoked."));
        if (!storedToken.userId().equals(userIdFromToken)) {
            throw new RefreshTokenInvalidException("refresh token user does not match.");
        }
        if (storedToken.expiresAt().isBefore(clock.instant())) {
            throw new RefreshTokenExpiredException("refresh token is expired.");
        }

        User user = userRepository.findById(userIdFromToken)
                .orElseThrow(() -> new RefreshTokenInvalidException("refresh token user is invalid."));

        JwtTokenIssuer.IssuedToken newAccessToken = jwtTokenIssuer.issueAccessToken(user.id());
        JwtTokenIssuer.IssuedToken newRefreshToken = jwtTokenIssuer.issueRefreshToken(user.id());

        refreshTokenRepository.delete(storedToken);
        refreshTokenRepository.save(
                new RefreshToken(user.id(), newRefreshToken.token(), newRefreshToken.expiresAt())
        );

        return new AuthLoginResult(
                newAccessToken.token(),
                newRefreshToken.token(),
                newAccessToken.expiresAt(),
                newRefreshToken.expiresAt(),
                new AuthLoginUser(
                        user.id(),
                        user.displayName(),
                        user.email(),
                        user.provider()
                )
        );
    }

    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RefreshTokenInvalidException("refresh token is blank.");
        }
        refreshTokenRepository.deleteByToken(refreshToken);
    }
}
