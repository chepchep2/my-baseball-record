package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.dto.game.request.BatterRecordRequest;
import com.chepchep2.mybaseballrecord.dto.game.request.GameCreateInfoRequest;
import com.chepchep2.mybaseballrecord.dto.game.request.GameCreateRequest;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
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

    @InjectMocks
    private GameCommandService gameCommandService;

    @Test
    @DisplayName("seasonYear를 생략하면 playedAt 연도로 저장한다")
    void createGameUsesPlayedAtYearWhenSeasonYearMissing() {
        GameCreateRequest request = new GameCreateRequest(
                new GameCreateInfoRequest(
                        LocalDate.parse("2026-03-18"),
                        null,
                        GameType.LEAGUE,
                        "블루스톰",
                        "레전드",
                        "메모"
                ),
                new BatterRecordRequest(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                null
        );

        when(gameRecordRepository.save(any())).thenAnswer(invocation -> {
            GameRecord game = invocation.getArgument(0);
            var field = game.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(game, 1L);
            return game;
        });
        when(batterRecordRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = gameCommandService.create(request);

        assertThat(response.gameInfo().seasonYear()).isEqualTo(2026);
    }

    @Test
    @DisplayName("seasonYear를 전달하면 전달값으로 저장한다")
    void createGameUsesGivenSeasonYear() {
        GameCreateRequest request = new GameCreateRequest(
                new GameCreateInfoRequest(
                        LocalDate.parse("2026-03-18"),
                        2030,
                        GameType.LEAGUE,
                        "블루스톰",
                        "레전드",
                        "메모"
                ),
                new BatterRecordRequest(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                null
        );

        when(gameRecordRepository.save(any())).thenAnswer(invocation -> {
            GameRecord game = invocation.getArgument(0);
            var field = game.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(game, 1L);
            return game;
        });
        when(batterRecordRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = gameCommandService.create(request);

        assertThat(response.gameInfo().seasonYear()).isEqualTo(2030);
    }

    @Test
    @DisplayName("batter가 있으면 game 저장 후 batter도 함께 저장한다")
    void createGameSavesGameAndBatter() throws Exception {
        GameCreateRequest request = new GameCreateRequest(
                new GameCreateInfoRequest(
                        LocalDate.parse("2026-03-18"),
                        2026,
                        GameType.LEAGUE,
                        "블루스톰",
                        "레전드",
                        "메모"
                ),
                new BatterRecordRequest(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                null
        );

        when(gameRecordRepository.save(any())).thenAnswer(invocation -> {
            GameRecord game = invocation.getArgument(0);
            var field = game.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(game, 1L);
            return game;
        });
        when(batterRecordRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        gameCommandService.create(request);

        ArgumentCaptor<BatterRecord> batterCaptor = ArgumentCaptor.forClass(BatterRecord.class);
        verify(gameRecordRepository).save(any(GameRecord.class));
        verify(batterRecordRepository).save(batterCaptor.capture());
        assertThat(batterCaptor.getValue().gameId()).isEqualTo(1L);
    }
}
