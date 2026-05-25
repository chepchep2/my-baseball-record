package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.dto.game.request.GameCreateRequest;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameCreateServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private PitcherRecordRepository pitcherRecordRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private GameCommandService gameCommandService;

    @Test
    @DisplayName("타자 1차 요청이면 played_at과 계산 필드를 저장하고 반환한다")
    void createGameStoresPlayedAtAndCalculatedFields() throws Exception {
        GameCreateRequest request = new GameCreateRequest(
                LocalDate.parse("2026-03-27"),
                19,
                0,
                5,
                1,
                2,
                0,
                0,
                1
        );

        when(gameRecordRepository.save(any())).thenAnswer(invocation -> {
            GameRecord game = invocation.getArgument(0);
            var field = game.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(game, 101L);
            return game;
        });
        when(batterRecordRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(currentUserProvider.getCurrentUserId()).thenReturn(5L);

        var response = gameCommandService.create(request);

        ArgumentCaptor<GameRecord> gameCaptor = ArgumentCaptor.forClass(GameRecord.class);
        ArgumentCaptor<BatterRecord> batterCaptor = ArgumentCaptor.forClass(BatterRecord.class);
        verify(gameRecordRepository).save(gameCaptor.capture());
        verify(batterRecordRepository).save(batterCaptor.capture());

        assertThat(gameCaptor.getValue().playedAt()).isEqualTo(LocalDateTime.of(2026, 3, 27, 19, 0));
        assertThat(gameCaptor.getValue().userId()).isEqualTo(5L);
        assertThat(batterCaptor.getValue().userId()).isEqualTo(5L);
        assertThat(batterCaptor.getValue().plateAppearances()).isEqualTo(5);
        assertThat(batterCaptor.getValue().atBats()).isEqualTo(4);
        assertThat(batterCaptor.getValue().hitByPitch()).isEqualTo(0);
        assertThat(batterCaptor.getValue().walks()).isEqualTo(1);

        assertThat(response.gameId()).isEqualTo(101L);
        assertThat(response.playedDate()).isEqualTo(LocalDate.parse("2026-03-27"));
        assertThat(response.playedHour()).isEqualTo(19);
        assertThat(response.playedMinute()).isEqualTo(0);
        assertThat(response.playedAtLabel()).isEqualTo("3/27 19:00");
        assertThat(response.atBats()).isEqualTo(4);
        assertThat(response.hits()).isEqualTo(3);
        assertThat(response.battingAverage()).isEqualTo(0.750);
        assertThat(response.onBasePercentage()).isEqualTo(0.800);
        assertThat(response.sluggingPercentage()).isEqualTo(1.500);
        assertThat(response.ops()).isEqualTo(2.300);
    }

    @Test
    @DisplayName("오늘 날짜의 미래 시간은 거부한다")
    void createGameRejectsFutureTimeToday() {
        gameCommandService = new GameCommandService(
                gameRecordRepository,
                batterRecordRepository,
                pitcherRecordRepository,
                currentUserProvider,
                Clock.fixed(
                        Instant.parse("2026-03-27T10:00:00Z"),
                        ZoneId.of("Asia/Seoul")
                )
        );

        GameCreateRequest request = new GameCreateRequest(
                LocalDate.parse("2026-03-27"),
                20,
                0,
                5,
                1,
                2,
                0,
                0,
                1
        );

        assertThatThrownBy(() -> gameCommandService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("future");
    }

    @Test
    @DisplayName("walksAndHitByPitch가 plateAppearances보다 크면 거부한다")
    void createGameRejectsInvalidWalksAndHitByPitch() {
        GameCreateRequest request = new GameCreateRequest(
                LocalDate.parse("2026-03-27"),
                19,
                0,
                2,
                3,
                0,
                0,
                0,
                0
        );

        assertThatThrownBy(() -> gameCommandService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("walksAndHitByPitch");
    }
}
