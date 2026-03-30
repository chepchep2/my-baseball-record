package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.domain.auth.RefreshToken;
import com.chepchep2.mybaseballrecord.domain.auth.User;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenRevokedException;
import com.chepchep2.mybaseballrecord.repository.auth.RefreshTokenRepository;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthRefreshServiceTest {

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    @Mock
    private JwtTokenIssuer jwtTokenIssuer;

    @Mock
    private RefreshTokenValidator refreshTokenValidator;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private Clock clock;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("유효한 refresh token이면 access/refresh를 재발급하고 기존 refresh를 회전한다")
    void refreshSessionRotatesRefreshToken() {
        RefreshToken stored = new RefreshToken(1L, "aaa.bbb.ccc", Instant.parse("2999-01-01T00:00:00Z"));
        User user = User.existing(1L, "kakao-sub-1", null, "조상우", "KAKAO", "https://k.kakaocdn.net/profile.png");

        when(refreshTokenValidator.validateAndGetUserId("aaa.bbb.ccc")).thenReturn(1L);
        when(refreshTokenRepository.findByToken("aaa.bbb.ccc")).thenReturn(Optional.of(stored));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(clock.instant()).thenReturn(Instant.parse("2026-03-19T07:00:00Z"));
        when(jwtTokenIssuer.issueAccessToken(1L))
                .thenReturn(new JwtTokenIssuer.IssuedToken("new-access", Instant.parse("2026-03-20T00:00:00Z")));
        when(jwtTokenIssuer.issueRefreshToken(1L))
                .thenReturn(new JwtTokenIssuer.IssuedToken("new.refresh.token", Instant.parse("2026-04-20T00:00:00Z")));

        var result = authService.refreshSession("aaa.bbb.ccc");

        assertThat(result.accessToken()).isEqualTo("new-access");
        assertThat(result.refreshToken()).isEqualTo("new.refresh.token");
        assertThat(result.user().id()).isEqualTo(1L);
        assertThat(result.user().profileImageUrl()).isEqualTo("https://k.kakaocdn.net/profile.png");
        verify(refreshTokenRepository).delete(stored);

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        assertThat(captor.getValue().userId()).isEqualTo(1L);
        assertThat(captor.getValue().token()).isEqualTo("new.refresh.token");
    }

    @Test
    @DisplayName("refresh token 형식이 잘못되면 RefreshTokenInvalidException")
    void refreshSessionFailsWhenTokenFormatIsInvalid() {
        when(refreshTokenValidator.validateAndGetUserId("not-jwt-format"))
                .thenThrow(new RefreshTokenInvalidException("refresh token format is invalid."));

        assertThatThrownBy(() -> authService.refreshSession("not-jwt-format"))
                .isInstanceOf(RefreshTokenInvalidException.class);
    }

    @Test
    @DisplayName("저장소에 없는 refresh token이면 RefreshTokenRevokedException")
    void refreshSessionFailsWhenTokenRevoked() {
        when(refreshTokenValidator.validateAndGetUserId("xxx.yyy.zzz")).thenReturn(1L);
        when(refreshTokenRepository.findByToken("xxx.yyy.zzz")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshSession("xxx.yyy.zzz"))
                .isInstanceOf(RefreshTokenRevokedException.class);
    }

    @Test
    @DisplayName("만료된 refresh token이면 RefreshTokenExpiredException")
    void refreshSessionFailsWhenTokenExpired() {
        RefreshToken expired = new RefreshToken(1L, "exp.ired.token", Instant.parse("2000-01-01T00:00:00Z"));
        when(refreshTokenValidator.validateAndGetUserId("exp.ired.token")).thenReturn(1L);
        when(refreshTokenRepository.findByToken("exp.ired.token")).thenReturn(Optional.of(expired));
        when(clock.instant()).thenReturn(Instant.parse("2026-03-19T07:00:00Z"));

        assertThatThrownBy(() -> authService.refreshSession("exp.ired.token"))
                .isInstanceOf(RefreshTokenExpiredException.class);
    }

    @Test
    @DisplayName("session bootstrap은 기존 refresh token을 유지하고 access token만 새로 발급한다")
    void getSessionKeepsExistingRefreshToken() {
        RefreshToken stored = new RefreshToken(1L, "aaa.bbb.ccc", Instant.parse("2999-01-01T00:00:00Z"));
        User user = User.existing(1L, "kakao-sub-1", "user@gmail.com", "조상우", "KAKAO");

        when(refreshTokenValidator.validateAndGetUserId("aaa.bbb.ccc")).thenReturn(1L);
        when(refreshTokenRepository.findByToken("aaa.bbb.ccc")).thenReturn(Optional.of(stored));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(clock.instant()).thenReturn(Instant.parse("2026-03-19T07:00:00Z"));
        when(jwtTokenIssuer.issueAccessToken(1L))
                .thenReturn(new JwtTokenIssuer.IssuedToken("bootstrap-access", Instant.parse("2026-03-20T00:00:00Z")));

        var result = authService.getSession("aaa.bbb.ccc");

        assertThat(result.accessToken()).isEqualTo("bootstrap-access");
        assertThat(result.refreshToken()).isEqualTo("aaa.bbb.ccc");
        verify(jwtTokenIssuer, never()).issueRefreshToken(1L);
        verify(refreshTokenRepository, never()).delete(stored);
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }
}
