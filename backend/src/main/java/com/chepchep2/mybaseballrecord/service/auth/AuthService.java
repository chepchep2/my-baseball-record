package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginResult;
import com.chepchep2.mybaseballrecord.dto.auth.AuthLoginUser;
import com.chepchep2.mybaseballrecord.dto.auth.KakaoUserInfo;
import com.chepchep2.mybaseballrecord.domain.auth.RefreshToken;
import com.chepchep2.mybaseballrecord.domain.auth.User;
import com.chepchep2.mybaseballrecord.exception.auth.KakaoAuthFailedException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenRevokedException;
import com.chepchep2.mybaseballrecord.infrastructure.config.KakaoAuthConfig;
import com.chepchep2.mybaseballrecord.repository.auth.RefreshTokenRepository;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Clock;
import java.time.Instant;

public class AuthService {
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtTokenIssuer jwtTokenIssuer;
    private final RefreshTokenValidator refreshTokenValidator;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;
    private final KakaoOauthClient kakaoOauthClient;
    private final KakaoAuthConfig kakaoAuthConfig;

    public AuthService(
            GoogleTokenVerifier googleTokenVerifier,
            JwtTokenIssuer jwtTokenIssuer,
            RefreshTokenValidator refreshTokenValidator,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            Clock clock
    ) {
        this(
                googleTokenVerifier,
                jwtTokenIssuer,
                refreshTokenValidator,
                userRepository,
                refreshTokenRepository,
                clock,
                null,
                null
        );
    }

    public AuthService(
            GoogleTokenVerifier googleTokenVerifier,
            JwtTokenIssuer jwtTokenIssuer,
            RefreshTokenValidator refreshTokenValidator,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            Clock clock,
            KakaoOauthClient kakaoOauthClient,
            KakaoAuthConfig kakaoAuthConfig
    ) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.jwtTokenIssuer = jwtTokenIssuer;
        this.refreshTokenValidator = refreshTokenValidator;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.clock = clock;
        this.kakaoOauthClient = kakaoOauthClient;
        this.kakaoAuthConfig = kakaoAuthConfig;
    }

    public AuthLoginResult loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleUserInfo googleUserInfo = googleTokenVerifier.verify(idToken);
        User user = userRepository.findByProviderAndProviderSubject("GOOGLE", googleUserInfo.subject())
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
                        user.provider(),
                        user.profileImageUrl()
                )
        );
    }

    public String getKakaoLoginUrl() {
        if (kakaoAuthConfig == null) {
            throw new UnsupportedOperationException("Kakao auth config is not configured yet.");
        }

        return UriComponentsBuilder.fromHttpUrl(kakaoAuthConfig.getAuthorizeBaseUrl())
                .path("/oauth/authorize")
                .queryParam("client_id", kakaoAuthConfig.getClientId())
                .queryParam("redirect_uri", kakaoAuthConfig.getRedirectUri())
                .queryParam("response_type", "code")
                .build(true)
                .toUriString();
    }

    public AuthLoginResult loginWithKakaoCode(String authorizationCode) {
        if (kakaoOauthClient == null) {
            throw new UnsupportedOperationException("Kakao OAuth client is not configured yet.");
        }

        KakaoUserInfo kakaoUserInfo = kakaoOauthClient.getUserInfo(authorizationCode);
        if (kakaoUserInfo == null || kakaoUserInfo.subject() == null || kakaoUserInfo.subject().isBlank()) {
            throw new KakaoAuthFailedException("kakao user info is invalid.");
        }

        User user = userRepository.findByProviderAndProviderSubject("KAKAO", kakaoUserInfo.subject())
                .map(existingUser -> {
                    existingUser.updateProfile(
                            kakaoUserInfo.email(),
                            kakaoUserInfo.nickname(),
                            kakaoUserInfo.profileImageUrl()
                    );
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> userRepository.save(
                        User.createNew(
                                kakaoUserInfo.subject(),
                                kakaoUserInfo.email(),
                                kakaoUserInfo.nickname(),
                                "KAKAO",
                                kakaoUserInfo.profileImageUrl()
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
                        user.provider(),
                        user.profileImageUrl()
                )
        );
    }

    public String getFrontendRedirectUrl() {
        if (kakaoAuthConfig == null) {
            throw new UnsupportedOperationException("Kakao auth config is not configured yet.");
        }
        return kakaoAuthConfig.getFrontendRedirectUri();
    }

    public AuthLoginResult getSession(String refreshToken) {
        ValidRefreshSession session = loadValidRefreshSession(refreshToken);
        JwtTokenIssuer.IssuedToken newAccessToken = jwtTokenIssuer.issueAccessToken(session.user().id());

        return new AuthLoginResult(
                newAccessToken.token(),
                session.storedToken().token(),
                newAccessToken.expiresAt(),
                session.storedToken().expiresAt(),
                new AuthLoginUser(
                        session.user().id(),
                        session.user().displayName(),
                        session.user().email(),
                        session.user().provider(),
                        session.user().profileImageUrl()
                )
        );
    }

    @Transactional
    public AuthLoginResult refreshSession(String refreshToken) {
        ValidRefreshSession session = loadValidRefreshSession(refreshToken);

        JwtTokenIssuer.IssuedToken newAccessToken = jwtTokenIssuer.issueAccessToken(session.user().id());
        JwtTokenIssuer.IssuedToken newRefreshToken = jwtTokenIssuer.issueRefreshToken(session.user().id());

        refreshTokenRepository.delete(session.storedToken());
        refreshTokenRepository.save(
                new RefreshToken(session.user().id(), newRefreshToken.token(), newRefreshToken.expiresAt())
        );

        return new AuthLoginResult(
                newAccessToken.token(),
                newRefreshToken.token(),
                newAccessToken.expiresAt(),
                newRefreshToken.expiresAt(),
                new AuthLoginUser(
                        session.user().id(),
                        session.user().displayName(),
                        session.user().email(),
                        session.user().provider(),
                        session.user().profileImageUrl()
                )
        );
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RefreshTokenInvalidException("refresh token is blank.");
        }
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    private ValidRefreshSession loadValidRefreshSession(String refreshToken) {
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
        return new ValidRefreshSession(storedToken, user);
    }

    private record ValidRefreshSession(
            RefreshToken storedToken,
            User user
    ) {
    }
}
