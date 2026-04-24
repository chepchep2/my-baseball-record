package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameDetailServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private PitcherRecordRepository pitcherRecordRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private GameQueryService gameQueryService;

    @Test
    @DisplayName("경기, 타자 기록이 있으면 상세 응답으로 반환한다")
    void getDetailReturnsFullResponse() throws Exception {
        GameRecord game = createGame(101L);
        BatterRecord batter = BatterRecord.builder()
                .gameId(101L)
                .plateAppearances(4)
                .atBats(3)
                .singles(1)
                .doubles(1)
                .triples(0)
                .homeRuns(1)
                .walks(1)
                .strikeOuts(0)
                .hitByPitch(0)
                .runsBattedIn(3)
                .runs(2)
                .stolenBases(0)
                .caughtStealing(0)
                .sacrificeHits(0)
                .build();
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findByGameId(101L)).thenReturn(Optional.of(batter));

        var response = gameQueryService.getDetail(101L);

        assertThat(response.gameId()).isEqualTo(101L);
        assertThat(response.playedDate()).isEqualTo(LocalDate.parse("2026-03-18"));
        assertThat(response.playedHour()).isEqualTo(0);
        assertThat(response.plateAppearances()).isEqualTo(4);
        assertThat(response.atBats()).isEqualTo(3);
        assertThat(response.hits()).isEqualTo(3);
        assertThat(response.battingAverage()).isEqualTo(1.0);
        assertThat(response.onBasePercentage()).isEqualTo(1.0);
        assertThat(response.sluggingPercentage()).isEqualTo(2.333);
        assertThat(response.ops()).isEqualTo(3.333);
    }

    @Test
    @DisplayName("타자/투수 기록이 없으면 null로 반환한다")
    void getDetailReturnsNullWhenSubRecordsMissing() throws Exception {
        GameRecord game = createGame(102L);
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByIdAndUserId(102L, 1L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findByGameId(102L)).thenReturn(Optional.empty());

        var response = gameQueryService.getDetail(102L);

        assertThat(response.batter()).isNull();
        assertThat(response.pitcher()).isNull();
    }

    @Test
    @DisplayName("경기가 없으면 GAME_NOT_FOUND 예외를 던진다")
    void getDetailThrowsWhenGameMissing() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gameQueryService.getDetail(999L))
                .isInstanceOf(GameNotFoundException.class);
    }

    private GameRecord createGame(long id) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(LocalDateTime.parse("2026-03-18T00:00:00"))
                .seasonYear(2026)
                .gameType(GameType.LEAGUE)
                .teamName("블루스톰")
                .opponentName("레전드")
                .memo("비 오는 날 경기")
                .userId(1L)
                .participationType(ParticipationType.BOTH)
                .build();
        var idField = GameRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(game, id);
        return game;
    }
}
