package com.chepchep2.mybaseballrecord.service.stats;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsSummaryResponse;
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

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
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
    private CurrentUserProvider currentUserProvider;

    @Mock
    private Clock clock;

    @InjectMocks
    private StatsQueryService statsQueryService;

    @Test
    @DisplayName("scope=season이면 현재 연도 기준 타자 홈 요약을 반환한다")
    void querySeasonSummary() throws Exception {
        GameRecord game = createGame(1L, 2026, LocalDateTime.parse("2026-03-18T19:00:00"));
        BatterRecord batter = BatterRecord.builder()
                .gameId(1L)
                .userId(1L)
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
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findAllVisibleByUserIdAndSeasonYear(1L, 2026)).thenReturn(List.of(game));
        when(batterRecordRepository.findAllByUserIdAndGameIdIn(1L, List.of(1L))).thenReturn(List.of(batter));

        BatterStatsSummaryResponse response = statsQueryService.query("season");

        assertThat(response.scope()).isEqualTo("season");
        assertThat(response.games()).isEqualTo(1);
        assertThat(response.plateAppearances()).isEqualTo(4);
        assertThat(response.walksAndHitByPitch()).isEqualTo(1);
        assertThat(response.battingAverage()).isEqualTo("0.667");
        assertThat(response.ops()).isEqualTo("1.750");
        assertThat(response.hits()).isEqualTo(2);
        assertThat(response.onBasePercentage()).isEqualTo("0.750");
        assertThat(response.sluggingPercentage()).isEqualTo("1.000");
    }

    @Test
    @DisplayName("scope=career이면 통산 타자 홈 요약을 반환한다")
    void queryCareerSummary() throws Exception {
        GameRecord game2025 = createGame(10L, 2025, LocalDateTime.parse("2025-03-18T19:00:00"));
        GameRecord game2026 = createGame(11L, 2026, LocalDateTime.parse("2026-03-19T14:10:00"));

        BatterRecord batter2025 = BatterRecord.builder()
                .gameId(10L)
                .userId(1L)
                .plateAppearances(4)
                .atBats(3)
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
                .sacrificeHits(0)
                .build();

        BatterRecord batter2026 = BatterRecord.builder()
                .gameId(11L)
                .userId(1L)
                .plateAppearances(5)
                .atBats(4)
                .singles(1)
                .doubles(1)
                .triples(0)
                .homeRuns(1)
                .walks(1)
                .strikeOuts(1)
                .hitByPitch(0)
                .runsBattedIn(3)
                .runs(2)
                .stolenBases(0)
                .caughtStealing(0)
                .sacrificeHits(0)
                .build();

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findAllVisibleByUserId(1L)).thenReturn(List.of(game2025, game2026));
        when(batterRecordRepository.findAllByUserIdAndGameIdIn(1L, List.of(10L, 11L))).thenReturn(List.of(batter2025, batter2026));

        BatterStatsSummaryResponse response = statsQueryService.query("career");

        assertThat(response.scope()).isEqualTo("career");
        assertThat(response.games()).isEqualTo(2);
        assertThat(response.plateAppearances()).isEqualTo(9);
        assertThat(response.walksAndHitByPitch()).isEqualTo(2);
        assertThat(response.hits()).isEqualTo(4);
        assertThat(response.battingAverage()).isEqualTo("0.571");
        assertThat(response.onBasePercentage()).isEqualTo("0.667");
        assertThat(response.sluggingPercentage()).isEqualTo("1.143");
        assertThat(response.ops()).isEqualTo("1.810");
    }

    @Test
    @DisplayName("scope=career이면 생성자와 기록 주인이 다른 shared 경기 기록도 합산한다")
    void queryCareerSummaryIncludesSharedGameByBatterOwner() throws Exception {
        GameRecord sharedGame = createGame(20L, 2026, LocalDateTime.parse("2026-04-01T09:30:00"), 99L);
        BatterRecord batter = BatterRecord.builder()
                .gameId(20L)
                .userId(1L)
                .plateAppearances(4)
                .atBats(3)
                .singles(1)
                .doubles(0)
                .triples(0)
                .homeRuns(1)
                .walks(1)
                .strikeOuts(0)
                .hitByPitch(0)
                .runsBattedIn(2)
                .runs(1)
                .stolenBases(0)
                .caughtStealing(0)
                .sacrificeHits(0)
                .build();

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findAllVisibleByUserId(1L)).thenReturn(List.of(sharedGame));
        when(batterRecordRepository.findAllByUserIdAndGameIdIn(1L, List.of(20L))).thenReturn(List.of(batter));

        BatterStatsSummaryResponse response = statsQueryService.query("career");

        assertThat(response.games()).isEqualTo(1);
        assertThat(response.hits()).isEqualTo(2);
        assertThat(response.plateAppearances()).isEqualTo(4);
        assertThat(response.ops()).isEqualTo("2.417");
    }

    private GameRecord createGame(long id, int seasonYear, LocalDateTime playedAt) throws Exception {
        return createGame(id, seasonYear, playedAt, 1L);
    }

    private GameRecord createGame(long id, int seasonYear, LocalDateTime playedAt, long userId) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(playedAt)
                .seasonYear(seasonYear)
                .gameType(GameType.LEAGUE)
                .teamName("블루스톰")
                .opponentName("레전드")
                .memo(null)
                .userId(userId)
                .participationType(ParticipationType.BATTER)
                .build();
        var idField = GameRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(game, id);
        return game;
    }
}
