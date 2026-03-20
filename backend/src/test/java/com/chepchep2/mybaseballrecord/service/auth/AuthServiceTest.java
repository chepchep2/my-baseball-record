package com.chepchep2.mybaseballrecord.service.auth;

import com.chepchep2.mybaseballrecord.domain.auth.RefreshToken;
import com.chepchep2.mybaseballrecord.domain.auth.User;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

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
    @DisplayName("신규 사용자면 user를 생성하고 access/refresh token을 발급한다")
    void loginWithGoogleCreatesUserAndIssuesTokens() {
        var googleUser = new GoogleTokenVerifier.GoogleUserInfo(
                "google-sub-1",
                "new-user@gmail.com",
                "신규유저"
        );

        when(googleTokenVerifier.verify("valid-id-token")).thenReturn(googleUser);
        when(userRepository.findByEmail("new-user@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.assignId(1L);
            return user;
        });
        when(jwtTokenIssuer.issueAccessToken(1L)).thenReturn(new JwtTokenIssuer.IssuedToken("access-token", Instant.parse("2026-03-18T10:00:00Z")));
        when(jwtTokenIssuer.issueRefreshToken(1L)).thenReturn(new JwtTokenIssuer.IssuedToken("refresh-token", Instant.parse("2026-04-17T10:00:00Z")));

        var result = authService.loginWithGoogle("valid-id-token");

        assertThat(result.accessToken()).isEqualTo("access-token");
        assertThat(result.refreshToken()).isEqualTo("refresh-token");
        assertThat(result.user().id()).isEqualTo(1L);
        assertThat(result.user().email()).isEqualTo("new-user@gmail.com");
        assertThat(result.user().provider()).isEqualTo("GOOGLE");

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        assertThat(captor.getValue().token()).isEqualTo("refresh-token");
        assertThat(captor.getValue().userId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("기존 사용자면 user를 재사용하고 refresh token을 갱신 저장한다")
    void loginWithGoogleForExistingUser() {
        User existing = User.existing(7L, "google-sub-7", "old-user@gmail.com", "기존유저");
        var googleUser = new GoogleTokenVerifier.GoogleUserInfo(
                "google-sub-7",
                "old-user@gmail.com",
                "기존유저"
        );

        when(googleTokenVerifier.verify("valid-id-token")).thenReturn(googleUser);
        when(userRepository.findByEmail("old-user@gmail.com")).thenReturn(Optional.of(existing));
        when(jwtTokenIssuer.issueAccessToken(7L)).thenReturn(new JwtTokenIssuer.IssuedToken("access-7", Instant.parse("2026-03-18T10:00:00Z")));
        when(jwtTokenIssuer.issueRefreshToken(7L)).thenReturn(new JwtTokenIssuer.IssuedToken("refresh-7", Instant.parse("2026-04-17T10:00:00Z")));

        var result = authService.loginWithGoogle("valid-id-token");

        assertThat(result.user().id()).isEqualTo(7L);
        assertThat(result.user().email()).isEqualTo("old-user@gmail.com");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }
}
