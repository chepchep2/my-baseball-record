package com.chepchep2.mybaseballrecord.service.stats;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.domain.stats.StatsGameFilter;
import com.chepchep2.mybaseballrecord.domain.stats.StatsRecordType;
import com.chepchep2.mybaseballrecord.domain.stats.StatsScope;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsDetails;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsResponse;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsSummary;
import com.chepchep2.mybaseballrecord.dto.stats.response.PitcherStatsDetails;
import com.chepchep2.mybaseballrecord.dto.stats.response.PitcherStatsResponse;
import com.chepchep2.mybaseballrecord.dto.stats.response.PitcherStatsSummary;
import com.chepchep2.mybaseballrecord.exception.stats.InvalidStatsQueryException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Year;
import java.util.List;

@Service
public class StatsQueryService {

    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final PitcherRecordRepository pitcherRecordRepository;
    private final Clock clock;

    public StatsQueryService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            PitcherRecordRepository pitcherRecordRepository,
            Clock clock
    ) {
        this.gameRecordRepository = gameRecordRepository;
        this.batterRecordRepository = batterRecordRepository;
        this.pitcherRecordRepository = pitcherRecordRepository;
        this.clock = clock;
    }

    public Object query(
            StatsScope scope,
            Integer seasonYear,
            StatsRecordType recordType,
            StatsGameFilter gameFilter
    ) {
        Integer targetSeasonYear = resolveSeasonYear(scope, seasonYear);
        List<GameRecord> filteredGames = filterGames(loadGamesByScope(targetSeasonYear), gameFilter);
        List<Long> gameIds = filteredGames.stream().map(GameRecord::id).toList();

        if (recordType == StatsRecordType.batter) {
            return buildBatterResponse(scope, targetSeasonYear, gameFilter, gameIds);
        }
        return buildPitcherResponse(scope, targetSeasonYear, gameFilter, gameIds);
    }

    private Integer resolveSeasonYear(StatsScope scope, Integer seasonYear) {
        if (scope == StatsScope.current_season) {
            return Year.now(clock).getValue();
        }
        if (scope == StatsScope.career) {
            return null;
        }
        if (seasonYear == null) {
            throw new InvalidStatsQueryException("seasonYear는 scope=season일 때 필수입니다.", "seasonYear");
        }
        return seasonYear;
    }

    private List<GameRecord> loadGamesByScope(Integer targetSeasonYear) {
        if (targetSeasonYear == null) {
            return gameRecordRepository.findAll();
        }
        return gameRecordRepository.findAllBySeasonYear(targetSeasonYear);
    }

    private List<GameRecord> filterGames(List<GameRecord> games, StatsGameFilter gameFilter) {
        if (gameFilter == StatsGameFilter.all) {
            return games;
        }
        if (gameFilter == StatsGameFilter.league) {
            return games.stream().filter(game -> game.gameType() == GameType.LEAGUE).toList();
        }
        return games.stream().filter(game -> game.gameType() == GameType.NON_OFFICIAL).toList();
    }

    private BatterStatsResponse buildBatterResponse(
            StatsScope scope,
            Integer targetSeasonYear,
            StatsGameFilter gameFilter,
            List<Long> gameIds
    ) {
        List<BatterRecord> batters = gameIds.isEmpty()
                ? List.of()
                : batterRecordRepository.findAllByGameIdIn(gameIds);

        int games = batters.size();
        int plateAppearances = sumBatters(batters, BatterRecord::plateAppearances);
        int atBats = sumBatters(batters, BatterRecord::atBats);
        int singles = sumBatters(batters, BatterRecord::singles);
        int doubles = sumBatters(batters, BatterRecord::doubles);
        int triples = sumBatters(batters, BatterRecord::triples);
        int homeRuns = sumBatters(batters, BatterRecord::homeRuns);
        int walks = sumBatters(batters, BatterRecord::walks);
        int hitByPitch = sumBatters(batters, BatterRecord::hitByPitch);
        int runsBattedIn = sumBatters(batters, BatterRecord::runsBattedIn);
        int runs = sumBatters(batters, BatterRecord::runs);
        int stolenBases = sumBatters(batters, BatterRecord::stolenBases);
        int caughtStealing = sumBatters(batters, BatterRecord::caughtStealing);
        int sacrificeHits = sumBatters(batters, BatterRecord::sacrificeHits);

        int hits = singles + doubles + triples + homeRuns;
        int totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);
        double battingAverage = ratio(hits, atBats);
        // OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
        // 현재 입력 모델에는 SF가 없어 0으로 간주한다.
        double onBasePercentage = ratio(hits + walks + hitByPitch, atBats + walks + hitByPitch);
        double sluggingPercentage = ratio(totalBases, atBats);
        double ops = onBasePercentage + sluggingPercentage;

        return new BatterStatsResponse(
                scope,
                targetSeasonYear,
                StatsRecordType.batter,
                gameFilter,
                new BatterStatsSummary(
                        games,
                        atBats,
                        hits,
                        formatDecimal(battingAverage, 3),
                        formatDecimal(ops, 3)
                ),
                new BatterStatsDetails(
                        plateAppearances,
                        homeRuns,
                        runsBattedIn,
                        formatDecimal(onBasePercentage, 3),
                        formatDecimal(sluggingPercentage, 3),
                        singles,
                        doubles,
                        triples,
                        walks,
                        hitByPitch,
                        stolenBases,
                        caughtStealing,
                        sacrificeHits,
                        runs
                ),
                batters.isEmpty()
        );
    }

    private PitcherStatsResponse buildPitcherResponse(
            StatsScope scope,
            Integer targetSeasonYear,
            StatsGameFilter gameFilter,
            List<Long> gameIds
    ) {
        List<PitcherRecord> pitchers = gameIds.isEmpty()
                ? List.of()
                : pitcherRecordRepository.findAllByGameIdIn(gameIds);

        int games = pitchers.size();
        int innings = sumPitchers(pitchers, PitcherRecord::innings);
        int additionalOuts = sumPitchers(pitchers, PitcherRecord::additionalOuts);
        int earnedRuns = sumPitchers(pitchers, PitcherRecord::earnedRuns);
        int hitsAllowed = sumPitchers(pitchers, PitcherRecord::hitsAllowed);
        int walks = sumPitchers(pitchers, PitcherRecord::walks);
        int strikeOuts = sumPitchers(pitchers, PitcherRecord::strikeOuts);
        int wins = sumPitchers(pitchers, PitcherRecord::wins);
        int losses = sumPitchers(pitchers, PitcherRecord::losses);
        int saves = sumPitchers(pitchers, PitcherRecord::saves);
        int holds = sumPitchers(pitchers, PitcherRecord::holds);
        int runsAllowed = sumPitchers(pitchers, PitcherRecord::runsAllowed);
        int hitByPitch = sumPitchers(pitchers, PitcherRecord::hitByPitch);
        int homeRunsAllowed = sumPitchers(pitchers, PitcherRecord::homeRunsAllowed);
        int battersFaced = sumPitchers(pitchers, PitcherRecord::battersFaced);
        int atBatsAgainst = Math.max(0, battersFaced - walks - hitByPitch);

        int totalOuts = (innings * 3) + additionalOuts;
        double inningsAsDouble = totalOuts / 3.0;
        double era = inningsAsDouble == 0.0 ? 0.0 : (earnedRuns * 9.0) / inningsAsDouble;
        double whip = inningsAsDouble == 0.0 ? 0.0 : (hitsAllowed + walks) / inningsAsDouble;
        // Opp BA = H / AB against
        // 현재 입력 모델에서는 AB against를 BF - BB - HBP로 근사한다.
        double opponentBattingAverage = ratio(hitsAllowed, atBatsAgainst);
        double strikeoutsPerNine = inningsAsDouble == 0.0 ? 0.0 : (strikeOuts * 9.0) / inningsAsDouble;

        return new PitcherStatsResponse(
                scope,
                targetSeasonYear,
                StatsRecordType.pitcher,
                gameFilter,
                new PitcherStatsSummary(
                        games,
                        toInningsDisplay(totalOuts),
                        formatDecimal(era, 2),
                        formatDecimal(whip, 2),
                        strikeOuts,
                        wins
                ),
                new PitcherStatsDetails(
                        losses,
                        saves,
                        holds,
                        runsAllowed,
                        earnedRuns,
                        hitsAllowed,
                        walks,
                        hitByPitch,
                        homeRunsAllowed,
                        battersFaced,
                        formatDecimal(opponentBattingAverage, 3),
                        formatDecimal(strikeoutsPerNine, 2)
                ),
                pitchers.isEmpty()
        );
    }

    private String toInningsDisplay(int totalOuts) {
        int innings = totalOuts / 3;
        int outs = totalOuts % 3;
        return innings + "." + outs;
    }

    private int sumBatters(List<BatterRecord> records, BatterIntExtractor extractor) {
        return records.stream().mapToInt(extractor::extract).sum();
    }

    private int sumPitchers(List<PitcherRecord> records, PitcherIntExtractor extractor) {
        return records.stream().mapToInt(extractor::extract).sum();
    }

    private double ratio(int numerator, int denominator) {
        if (denominator == 0) {
            return 0.0;
        }
        return (double) numerator / denominator;
    }

    private String formatDecimal(double value, int scale) {
        return BigDecimal.valueOf(value)
                .setScale(scale, RoundingMode.HALF_UP)
                .toPlainString();
    }

    @FunctionalInterface
    private interface BatterIntExtractor {
        int extract(BatterRecord record);
    }

    @FunctionalInterface
    private interface PitcherIntExtractor {
        int extract(PitcherRecord record);
    }
}
