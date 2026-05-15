package com.chepchep2.mybaseballrecord.service.stats;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.dto.stats.response.BatterStatsSummaryResponse;
import com.chepchep2.mybaseballrecord.exception.stats.InvalidStatsQueryException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
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
    @SuppressWarnings("unused")
    private final PitcherRecordRepository pitcherRecordRepository;
    private final CurrentUserProvider currentUserProvider;
    private final Clock clock;

    public StatsQueryService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            PitcherRecordRepository pitcherRecordRepository,
            CurrentUserProvider currentUserProvider,
            Clock clock
    ) {
        this.gameRecordRepository = gameRecordRepository;
        this.batterRecordRepository = batterRecordRepository;
        this.pitcherRecordRepository = pitcherRecordRepository;
        this.currentUserProvider = currentUserProvider;
        this.clock = clock;
    }

    public BatterStatsSummaryResponse query(String scope) {
        long userId = currentUserProvider.getCurrentUserId();
        Integer seasonYear = resolveScope(scope);
        List<GameRecord> games = seasonYear == null
                ? gameRecordRepository.findAllVisibleByUserId(userId)
                : gameRecordRepository.findAllVisibleByUserIdAndSeasonYear(userId, seasonYear);
        List<Long> gameIds = games.stream().map(GameRecord::id).toList();
        List<BatterRecord> batters = gameIds.isEmpty()
                ? List.of()
                : batterRecordRepository.findAllByUserIdAndGameIdIn(userId, gameIds);

        int atBats = sumBatters(batters, BatterRecord::atBats);
        int plateAppearances = sumBatters(batters, BatterRecord::plateAppearances);
        int singles = sumBatters(batters, BatterRecord::singles);
        int doubles = sumBatters(batters, BatterRecord::doubles);
        int triples = sumBatters(batters, BatterRecord::triples);
        int homeRuns = sumBatters(batters, BatterRecord::homeRuns);
        int walks = sumBatters(batters, BatterRecord::walks);
        int hitByPitch = sumBatters(batters, BatterRecord::hitByPitch);
        int walksAndHitByPitch = walks + hitByPitch;

        int hits = singles + doubles + triples + homeRuns;
        int totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);
        double battingAverage = ratio(hits, atBats);
        double onBasePercentage = ratio(hits + walksAndHitByPitch, atBats + walksAndHitByPitch);
        double sluggingPercentage = ratio(totalBases, atBats);
        double ops = onBasePercentage + sluggingPercentage;

        return new BatterStatsSummaryResponse(
                scope,
                games.size(),
                plateAppearances,
                walksAndHitByPitch,
                formatDecimal(battingAverage, 3),
                formatDecimal(ops, 3),
                hits,
                formatDecimal(onBasePercentage, 3),
                formatDecimal(sluggingPercentage, 3)
        );
    }

    private Integer resolveScope(String scope) {
        if ("season".equals(scope)) {
            return Year.now(clock).getValue();
        }
        if ("career".equals(scope)) {
            return null;
        }
        throw new InvalidStatsQueryException("scope는 season 또는 career만 허용합니다.", "scope");
    }

    private int sumBatters(List<BatterRecord> records, BatterIntExtractor extractor) {
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
}
