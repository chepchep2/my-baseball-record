package com.chepchep2.mybaseballrecord.repository.auth;

import com.chepchep2.mybaseballrecord.domain.auth.RefreshToken;
import com.chepchep2.mybaseballrecord.domain.auth.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class AuthRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    @DisplayName("user를 저장하고 provider/providerSubject로 다시 조회할 수 있다")
    void saveAndFindUserByProviderAndProviderSubject() {
        User saved = userRepository.save(User.createNew("kakao-sub-1", null, "조상우", "KAKAO", "https://k.kakaocdn.net/profile.png"));

        var found = userRepository.findByProviderAndProviderSubject("KAKAO", "kakao-sub-1");

        assertThat(saved.id()).isNotNull();
        assertThat(found).isPresent();
        assertThat(found.get().providerSubject()).isEqualTo("kakao-sub-1");
        assertThat(found.get().email()).isNull();
        assertThat(found.get().profileImageUrl()).isEqualTo("https://k.kakaocdn.net/profile.png");
        assertThat(found.get().createdAt()).isNotNull();
        assertThat(found.get().updatedAt()).isNotNull();
        assertThat(found.get().lastLoginAt()).isNull();
    }

    @Test
    @DisplayName("refresh token을 저장하면 userId와 token 값이 유지된다")
    void saveRefreshToken() {
        User user = userRepository.save(User.createNew("google-sub-2", "token-user@gmail.com", "토큰유저", "GOOGLE", null));

        RefreshToken saved = refreshTokenRepository.save(
                new RefreshToken(user.id(), "refresh-token", Instant.parse("2026-04-17T10:00:00Z"))
        );

        assertThat(saved.userId()).isEqualTo(user.id());
        assertThat(saved.token()).isEqualTo("refresh-token");
    }

    @Test
    @DisplayName("refresh token으로 조회할 수 있다")
    void findRefreshTokenByToken() {
        User user = userRepository.save(User.createNew("google-sub-3", "find-token-user@gmail.com", "조회유저", "GOOGLE", null));
        refreshTokenRepository.save(
                new RefreshToken(user.id(), "refresh-token-find", Instant.parse("2026-04-17T10:00:00Z"))
        );

        var found = refreshTokenRepository.findByToken("refresh-token-find");

        assertThat(found).isPresent();
        assertThat(found.get().userId()).isEqualTo(user.id());
    }

    @Test
    @DisplayName("refresh token을 삭제하면 token으로 조회되지 않는다")
    void deleteRefreshTokenByToken() {
        User user = userRepository.save(User.createNew("google-sub-4", "delete-token-user@gmail.com", "삭제유저", "GOOGLE", null));
        refreshTokenRepository.save(
                new RefreshToken(user.id(), "refresh-token-delete", Instant.parse("2026-04-17T10:00:00Z"))
        );

        refreshTokenRepository.deleteByToken("refresh-token-delete");

        assertThat(refreshTokenRepository.findByToken("refresh-token-delete")).isEmpty();
    }
}
