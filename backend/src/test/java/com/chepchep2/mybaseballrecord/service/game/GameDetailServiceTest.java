package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
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

    @InjectMocks
    private GameQueryService gameQueryService;

    @Test
    @DisplayName("경기, 타자, 투수 기록이 있으면 상세 응답으로 반환한다")
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
        PitcherRecord pitcher = PitcherRecord.builder()
                .gameId(101L)
                .innings(1)
                .additionalOuts(0)
                .runsAllowed(0)
                .earnedRuns(0)
                .hitsAllowed(1)
                .walks(0)
                .hitByPitch(0)
                .homeRunsAllowed(0)
                .strikeOuts(2)
                .battersFaced(4)
                .wins(0)
                .losses(0)
                .saves(0)
                .holds(0)
                .build();

        when(gameRecordRepository.findById(101L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findByGameId(101L)).thenReturn(Optional.of(batter));
        when(pitcherRecordRepository.findByGameId(101L)).thenReturn(Optional.of(pitcher));

        var response = gameQueryService.getDetail(101L);

        assertThat(response.id()).isEqualTo(101L);
        assertThat(response.gameInfo().gameType()).isEqualTo(GameType.LEAGUE);
        assertThat(response.participationType()).isEqualTo(ParticipationType.BOTH);
        assertThat(response.batter()).isNotNull();
        assertThat(response.pitcher()).isNotNull();
    }

    @Test
    @DisplayName("타자/투수 기록이 없으면 null로 반환한다")
    void getDetailReturnsNullWhenSubRecordsMissing() throws Exception {
        GameRecord game = createGame(102L);
        when(gameRecordRepository.findById(102L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findByGameId(102L)).thenReturn(Optional.empty());
        when(pitcherRecordRepository.findByGameId(102L)).thenReturn(Optional.empty());

        var response = gameQueryService.getDetail(102L);

        assertThat(response.batter()).isNull();
        assertThat(response.pitcher()).isNull();
    }

    @Test
    @DisplayName("경기가 없으면 GAME_NOT_FOUND 예외를 던진다")
    void getDetailThrowsWhenGameMissing() {
        when(gameRecordRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gameQueryService.getDetail(999L))
                .isInstanceOf(GameNotFoundException.class);
    }

    private GameRecord createGame(long id) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(LocalDate.parse("2026-03-18"))
                .seasonYear(2026)
                .gameType(GameType.LEAGUE)
                .teamName("블루스톰")
                .opponentName("레전드")
                .memo("비 오는 날 경기")
                .participationType(ParticipationType.BOTH)
                .build();
        var idField = GameRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(game, id);
        return game;
    }
}
