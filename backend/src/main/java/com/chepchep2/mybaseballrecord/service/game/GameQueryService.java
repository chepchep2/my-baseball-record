package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.dto.game.response.GameBatterResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGameItemResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGamesResponse;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class GameQueryService {

    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final CurrentUserProvider currentUserProvider;

    public GameQueryService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.gameRecordRepository = gameRecordRepository;
        this.batterRecordRepository = batterRecordRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public GameDetailResponse getDetail(long gameId) {
        long userId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findByIdAndUserId(gameId, userId)
                .orElseThrow(() -> new GameNotFoundException(gameId));

        BatterRecord batter = batterRecordRepository.findByGameId(gameId).orElse(null);

        return toMilestoneDetail(game, batter);
    }

    public RecentGamesResponse getGames(Integer year, Integer month) {
        long userId = currentUserProvider.getCurrentUserId();
        List<GameRecord> games;

        if (year == null) {
            games = gameRecordRepository.findByUserIdOrderByPlayedAtDesc(userId);
        } else if (month == null) {
            LocalDate start = LocalDate.of(year, 1, 1);
            games = gameRecordRepository.findByUserIdAndPlayedAtBetweenOrderByPlayedAtDesc(
                    userId,
                    start.atStartOfDay(),
                    start.plusYears(1).atStartOfDay()
            );
        } else {
            LocalDate start = LocalDate.of(year, month, 1);
            games = gameRecordRepository.findByUserIdAndPlayedAtBetweenOrderByPlayedAtDesc(
                    userId,
                    start.atStartOfDay(),
                    start.plusMonths(1).atStartOfDay()
            );
        }

        return new RecentGamesResponse(games.stream().map(this::toRecentItem).toList());
    }

    public RecentGamesResponse getRecent(int limit) {
        long userId = currentUserProvider.getCurrentUserId();
        int boundedLimit = Math.max(1, Math.min(limit, 20));
        List<GameRecord> games = gameRecordRepository.findByUserIdOrderByPlayedAtDesc(
                userId,
                PageRequest.of(0, boundedLimit)
        );

        return new RecentGamesResponse(games.stream().map(this::toRecentItem).toList());
    }

    private GameBatterResponse toBatterResponse(BatterRecord batter) {
        return new GameBatterResponse(
                batter.plateAppearances(),
                batter.atBats(),
                batter.singles(),
                batter.doubles(),
                batter.triples(),
                batter.homeRuns(),
                batter.walks(),
                batter.strikeOuts(),
                batter.hitByPitch(),
                batter.runsBattedIn(),
                batter.runs(),
                batter.stolenBases(),
                batter.caughtStealing(),
                batter.sacrificeHits()
        );
    }

    private RecentGameItemResponse toRecentItem(GameRecord game) {
        BatterRecord batter = batterRecordRepository.findByGameId(game.id()).orElse(null);
        int plateAppearances = batter == null ? 0 : batter.plateAppearances();
        int walksAndHitByPitch = batter == null ? 0 : batter.walks() + batter.hitByPitch();
        int singles = batter == null ? 0 : batter.singles();
        int doubles = batter == null ? 0 : batter.doubles();
        int triples = batter == null ? 0 : batter.triples();
        int homeRuns = batter == null ? 0 : batter.homeRuns();
        int atBats = batter == null ? 0 : batter.atBats();
        int hits = singles + doubles + triples + homeRuns;
        int totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);
        String battingAverage = formatDecimal(ratio(hits, atBats), 3);
        String onBasePercentage = formatDecimal(ratio(hits + walksAndHitByPitch, atBats + walksAndHitByPitch), 3);
        String sluggingPercentage = formatDecimal(ratio(totalBases, atBats), 3);
        String ops = formatDecimal(Double.parseDouble(onBasePercentage) + Double.parseDouble(sluggingPercentage), 3);

        return new RecentGameItemResponse(
                game.id(),
                game.playedAt().toLocalDate().toString(),
                game.playedAt().getHour(),
                game.playedAt().getMinute(),
                game.playedAt().format(DateTimeFormatter.ofPattern("M/d HH:mm")),
                plateAppearances,
                walksAndHitByPitch,
                singles,
                doubles,
                triples,
                homeRuns,
                atBats,
                hits,
                battingAverage,
                onBasePercentage,
                sluggingPercentage,
                ops
        );
    }

    private GameDetailResponse toMilestoneDetail(GameRecord game, BatterRecord batter) {
        if (batter == null) {
            return new GameDetailResponse(
                    game.id(),
                    game.playedAt().toLocalDate(),
                    game.playedAt().getHour(),
                    game.playedAt().getMinute(),
                    game.playedAt().format(DateTimeFormatter.ofPattern("M/d HH:mm")),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    game.seasonYear(),
                    game.gameType(),
                    game.teamName(),
                    game.opponentName(),
                    game.memo(),
                    game.participationType(),
                    null,
                    null
            );
        }

        int hits = batter.singles() + batter.doubles() + batter.triples() + batter.homeRuns();
        int totalBases = batter.singles() + (batter.doubles() * 2) + (batter.triples() * 3) + (batter.homeRuns() * 4);
        double battingAverage = ratio(hits, batter.atBats());
        double onBasePercentage = ratio(hits + batter.walks() + batter.hitByPitch(), batter.plateAppearances());
        double sluggingPercentage = ratio(totalBases, batter.atBats());
        double ops = onBasePercentage + sluggingPercentage;

        return new GameDetailResponse(
                game.id(),
                game.playedAt().toLocalDate(),
                game.playedAt().getHour(),
                game.playedAt().getMinute(),
                game.playedAt().format(DateTimeFormatter.ofPattern("M/d HH:mm")),
                batter.plateAppearances(),
                batter.walks() + batter.hitByPitch(),
                batter.singles(),
                batter.doubles(),
                batter.triples(),
                batter.homeRuns(),
                batter.atBats(),
                hits,
                round3(battingAverage),
                round3(onBasePercentage),
                round3(sluggingPercentage),
                round3(ops),
                game.seasonYear(),
                game.gameType(),
                game.teamName(),
                game.opponentName(),
                game.memo(),
                game.participationType(),
                toBatterResponse(batter),
                null
        );
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

    private double round3(double value) {
        return Math.round(value * 1000) / 1000.0;
    }
}
