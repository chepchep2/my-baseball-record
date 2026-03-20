package com.chepchep2.mybaseballrecord.service.stats;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.domain.stats.StatsGameFilter;
import com.chepchep2.mybaseballrecord.domain.stats.StatsRecordType;
import com.chepchep2.mybaseballrecord.domain.stats.StatsScope;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsResponse;
import com.chepchep2.mybaseballrecord.dto.stats.response.PitcherStatsResponse;
import com.chepchep2.mybaseballrecord.exception.stats.InvalidStatsQueryException;
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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsQueryServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private PitcherRecordRepository pitcherRecordRepository;

    @Mock
    private java.time.Clock clock;

    @InjectMocks
    private StatsQueryService statsQueryService;

    @Test
    @DisplayName("batter current_season all 집계를 계산한다")
    void queryBatterStatsCurrentSeasonAll() throws Exception {
        GameRecord game = createGame(1L, 2026, GameType.LEAGUE);
        BatterRecord batter = BatterRecord.builder()
                .gameId(1L)
                .plateAppearances(4)
                .atBats(3)
                .singles(1)
                .doubles(1)
                .triples(0)
                .homeRuns(0)
                .walks(1)
                .strikeOuts(1)
                .hitByPitch(0)
                .runsBattedIn(2)
                .runs(1)
                .stolenBases(0)
                .caughtStealing(0)
                .sacrificeHits(0)
                .build();

        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));
        when(clock.instant()).thenReturn(ZonedDateTime.parse("2026-03-20T00:00:00Z").toInstant());
        when(gameRecordRepository.findAllBySeasonYear(2026)).thenReturn(List.of(game));
        when(batterRecordRepository.findAllByGameIdIn(List.of(1L))).thenReturn(List.of(batter));

        BatterStatsResponse response = (BatterStatsResponse) statsQueryService.query(
                StatsScope.current_season,
                null,
                StatsRecordType.batter,
                StatsGameFilter.all
        );

        assertThat(response.seasonYear()).isEqualTo(2026);
        assertThat(response.summary().games()).isEqualTo(1);
        assertThat(response.summary().atBats()).isEqualTo(3);
        assertThat(response.summary().hits()).isEqualTo(2);
        assertThat(response.summary().battingAverage()).isEqualTo("0.667");
        assertThat(response.summary().ops()).isEqualTo("1.750");
        assertThat(response.isEmpty()).isFalse();
    }

    @Test
    @DisplayName("pitcher career league 집계를 계산한다")
    void queryPitcherStatsCareerLeague() throws Exception {
        GameRecord leagueGame = createGame(10L, 2025, GameType.LEAGUE);
        GameRecord nonOfficialGame = createGame(11L, 2025, GameType.NON_OFFICIAL);

        PitcherRecord pitcherLeague = PitcherRecord.builder()
                .gameId(10L)
                .innings(3)
                .additionalOuts(2)
                .runsAllowed(1)
                .earnedRuns(1)
                .hitsAllowed(3)
                .walks(1)
                .hitByPitch(0)
                .homeRunsAllowed(0)
                .strikeOuts(4)
                .battersFaced(15)
                .wins(1)
                .losses(0)
                .saves(0)
                .holds(0)
                .build();

        when(gameRecordRepository.findAll()).thenReturn(List.of(leagueGame, nonOfficialGame));
        when(pitcherRecordRepository.findAllByGameIdIn(List.of(10L))).thenReturn(List.of(pitcherLeague));

        PitcherStatsResponse response = (PitcherStatsResponse) statsQueryService.query(
                StatsScope.career,
                null,
                StatsRecordType.pitcher,
                StatsGameFilter.league
        );

        assertThat(response.seasonYear()).isNull();
        assertThat(response.summary().games()).isEqualTo(1);
        assertThat(response.summary().inningsPitchedDisplay()).isEqualTo("3.2");
        assertThat(response.summary().era()).isEqualTo("2.45");
        assertThat(response.summary().whip()).isEqualTo("1.09");
        assertThat(response.summary().strikeOuts()).isEqualTo(4);
        assertThat(response.summary().wins()).isEqualTo(1);
        assertThat(response.details().opponentBattingAverage()).isEqualTo("0.214");
    }

    @Test
    @DisplayName("scope=season에서 seasonYear 누락이면 예외를 던진다")
    void queryThrowsWhenSeasonYearMissing() {
        assertThatThrownBy(() -> statsQueryService.query(
                StatsScope.season,
                null,
                StatsRecordType.batter,
                StatsGameFilter.all
        ))
                .isInstanceOf(InvalidStatsQueryException.class)
                .hasMessageContaining("seasonYear");
    }

    @Test
    @DisplayName("OBP는 sacrificeHits를 분모에 포함하지 않는다")
    void queryBatterObpDoesNotUseSacrificeHits() throws Exception {
        GameRecord game = createGame(2L, 2026, GameType.LEAGUE);
        BatterRecord batter = BatterRecord.builder()
                .gameId(2L)
                .plateAppearances(5)
                .atBats(2)
                .singles(1)
                .doubles(0)
                .triples(0)
                .homeRuns(0)
                .walks(1)
                .strikeOuts(0)
                .hitByPitch(0)
                .runsBattedIn(0)
                .runs(0)
                .stolenBases(0)
                .caughtStealing(0)
                .sacrificeHits(2)
                .build();

        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));
        when(clock.instant()).thenReturn(ZonedDateTime.parse("2026-03-20T00:00:00Z").toInstant());
        when(gameRecordRepository.findAllBySeasonYear(2026)).thenReturn(List.of(game));
        when(batterRecordRepository.findAllByGameIdIn(List.of(2L))).thenReturn(List.of(batter));

        BatterStatsResponse response = (BatterStatsResponse) statsQueryService.query(
                StatsScope.current_season,
                null,
                StatsRecordType.batter,
                StatsGameFilter.all
        );

        assertThat(response.details().onBasePercentage()).isEqualTo("0.667");
    }

    private GameRecord createGame(long id, int seasonYear, GameType gameType) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(LocalDate.parse(seasonYear + "-03-18"))
                .seasonYear(seasonYear)
                .gameType(gameType)
                .teamName("블루스톰")
                .opponentName("레전드")
                .memo(null)
                .participationType(ParticipationType.BOTH)
                .build();
        var idField = GameRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(game, id);
        return game;
    }
}
