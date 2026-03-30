package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.dto.game.response.GameBatterResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameInfoResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GamePitcherResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGameItemResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGamesResponse;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class GameQueryService {

    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final PitcherRecordRepository pitcherRecordRepository;
    private final CurrentUserProvider currentUserProvider;

    public GameQueryService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            PitcherRecordRepository pitcherRecordRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.gameRecordRepository = gameRecordRepository;
        this.batterRecordRepository = batterRecordRepository;
        this.pitcherRecordRepository = pitcherRecordRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public GameDetailResponse getDetail(long gameId) {
        long userId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findByIdAndUserId(gameId, userId)
                .orElseThrow(() -> new GameNotFoundException(gameId));

        GameBatterResponse batter = batterRecordRepository.findByGameId(gameId)
                .map(this::toBatterResponse)
                .orElse(null);
        GamePitcherResponse pitcher = pitcherRecordRepository.findByGameId(gameId)
                .map(this::toPitcherResponse)
                .orElse(null);

        return new GameDetailResponse(
                game.id(),
                new GameInfoResponse(
                        game.playedAt().toLocalDate(),
                        game.seasonYear(),
                        game.gameType(),
                        game.teamName(),
                        game.opponentName(),
                        game.memo()
                ),
                game.participationType(),
                batter,
                pitcher
        );
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

    private GamePitcherResponse toPitcherResponse(PitcherRecord pitcher) {
        return new GamePitcherResponse(
                pitcher.innings(),
                pitcher.additionalOuts(),
                pitcher.runsAllowed(),
                pitcher.earnedRuns(),
                pitcher.hitsAllowed(),
                pitcher.walks(),
                pitcher.hitByPitch(),
                pitcher.homeRunsAllowed(),
                pitcher.strikeOuts(),
                pitcher.battersFaced(),
                pitcher.wins(),
                pitcher.losses(),
                pitcher.saves(),
                pitcher.holds()
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
}
