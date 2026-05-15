package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.dto.game.request.GameCreateRequest;
import com.chepchep2.mybaseballrecord.dto.game.request.GameUpdateInfoRequest;
import com.chepchep2.mybaseballrecord.dto.game.request.GameUpdateRequest;
import com.chepchep2.mybaseballrecord.dto.game.response.GameBatterResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameInfoResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GamePitcherResponse;
import com.chepchep2.mybaseballrecord.exception.game.GameImmutableFieldException;
import com.chepchep2.mybaseballrecord.exception.game.InvalidGameCreateException;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class GameCommandService {
    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final PitcherRecordRepository pitcherRecordRepository;
    private final CurrentUserProvider currentUserProvider;
    private final Clock clock;

    @Autowired
    public GameCommandService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            PitcherRecordRepository pitcherRecordRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this(
                gameRecordRepository,
                batterRecordRepository,
                pitcherRecordRepository,
                currentUserProvider,
                Clock.system(ZoneId.of("Asia/Seoul"))
        );
    }

    public GameCommandService(
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
        this.clock = clock == null ? Clock.system(ZoneId.of("Asia/Seoul")) : clock;
    }

    @Transactional
    public GameDetailResponse create(GameCreateRequest request) {
        long userId = currentUserProvider.getCurrentUserId();
        validateCreateRequest(request);
        LocalDateTime playedAt = LocalDateTime.of(
                request.playedDate(),
                java.time.LocalTime.of(request.playedHour(), request.playedMinute())
        );
        int seasonYear = request.playedDate().getYear();

        GameRecord savedGame = gameRecordRepository.save(
                GameRecord.builder()
                        .playedAt(playedAt)
                        .seasonYear(seasonYear)
                        .gameType(com.chepchep2.mybaseballrecord.domain.game.GameType.LEAGUE)
                        .teamName("")
                        .opponentName("")
                        .memo(null)
                        .userId(userId)
                        .createdByUserId(userId)
                        .participationType(ParticipationType.BATTER)
                        .build()
        );

        int walks = request.walksAndHitByPitch();
        int hitByPitch = 0;
        int atBats = request.plateAppearances() - request.walksAndHitByPitch();
        int hits = request.singles() + request.doubles() + request.triples() + request.homeRuns();

        BatterRecord savedBatter = batterRecordRepository.save(
                BatterRecord.builder()
                        .gameId(savedGame.id())
                        .userId(userId)
                        .plateAppearances(request.plateAppearances())
                        .atBats(atBats)
                        .singles(request.singles())
                        .doubles(request.doubles())
                        .triples(request.triples())
                        .homeRuns(request.homeRuns())
                        .walks(walks)
                        .strikeOuts(0)
                        .hitByPitch(hitByPitch)
                        .runsBattedIn(0)
                        .runs(0)
                        .stolenBases(0)
                        .caughtStealing(0)
                        .sacrificeHits(0)
                        .build()
        );

        return toMilestoneCreateDetail(savedGame, savedBatter);
    }

    @Transactional
    public GameDetailResponse update(long gameId, GameUpdateRequest request) {
        long userId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findByIdAndUserId(gameId, userId)
                .orElseThrow(() -> new GameNotFoundException(gameId));

        validateImmutableFields(game, request.gameInfo());
        LocalDateTime updatedPlayedAt = resolvePlayedAt(game, request.gameInfo());
        ParticipationType participationType = resolveParticipationType(request);
        game.updateMutableFields(
                updatedPlayedAt,
                updatedPlayedAt.getYear(),
                normalizeOptionalName(request.gameInfo().teamName()),
                normalizeOptionalName(request.gameInfo().opponentName()),
                request.gameInfo().memo(),
                participationType
        );

        GameRecord savedGame = gameRecordRepository.save(game);

        if (request.batter() != null) {
            batterRecordRepository.findByGameIdAndUserId(gameId, userId)
                    .ifPresentOrElse(
                            existing -> existing.update(
                                    request.batter().plateAppearances(),
                                    request.batter().atBats(),
                                    request.batter().singles(),
                                    request.batter().doubles(),
                                    request.batter().triples(),
                                    request.batter().homeRuns(),
                                    request.batter().walks(),
                                    request.batter().strikeOuts(),
                                    request.batter().hitByPitch(),
                                    request.batter().runsBattedIn(),
                                    request.batter().runs(),
                                    request.batter().stolenBases(),
                                    request.batter().caughtStealing(),
                                    request.batter().sacrificeHits()
                            ),
                            () -> batterRecordRepository.save(
                                    BatterRecord.builder()
                                            .gameId(gameId)
                                            .userId(userId)
                                            .plateAppearances(request.batter().plateAppearances())
                                            .atBats(request.batter().atBats())
                                            .singles(request.batter().singles())
                                            .doubles(request.batter().doubles())
                                            .triples(request.batter().triples())
                                            .homeRuns(request.batter().homeRuns())
                                            .walks(request.batter().walks())
                                            .strikeOuts(request.batter().strikeOuts())
                                            .hitByPitch(request.batter().hitByPitch())
                                            .runsBattedIn(request.batter().runsBattedIn())
                                            .runs(request.batter().runs())
                                            .stolenBases(request.batter().stolenBases())
                                            .caughtStealing(request.batter().caughtStealing())
                                            .sacrificeHits(request.batter().sacrificeHits())
                                            .build()
                            )
                    );
        } else {
            batterRecordRepository.deleteByGameIdAndUserId(gameId, userId);
        }

        if (request.pitcher() != null) {
            pitcherRecordRepository.findByGameId(gameId)
                    .ifPresentOrElse(
                            existing -> existing.update(
                                    request.pitcher().innings(),
                                    request.pitcher().additionalOuts(),
                                    request.pitcher().runsAllowed(),
                                    request.pitcher().earnedRuns(),
                                    request.pitcher().hitsAllowed(),
                                    request.pitcher().walks(),
                                    request.pitcher().hitByPitch(),
                                    request.pitcher().homeRunsAllowed(),
                                    request.pitcher().strikeOuts(),
                                    request.pitcher().battersFaced(),
                                    request.pitcher().wins(),
                                    request.pitcher().losses(),
                                    request.pitcher().saves(),
                                    request.pitcher().holds()
                            ),
                            () -> pitcherRecordRepository.save(
                                    PitcherRecord.builder()
                                            .gameId(gameId)
                                            .innings(request.pitcher().innings())
                                            .additionalOuts(request.pitcher().additionalOuts())
                                            .runsAllowed(request.pitcher().runsAllowed())
                                            .earnedRuns(request.pitcher().earnedRuns())
                                            .hitsAllowed(request.pitcher().hitsAllowed())
                                            .walks(request.pitcher().walks())
                                            .hitByPitch(request.pitcher().hitByPitch())
                                            .homeRunsAllowed(request.pitcher().homeRunsAllowed())
                                            .strikeOuts(request.pitcher().strikeOuts())
                                            .battersFaced(request.pitcher().battersFaced())
                                            .wins(request.pitcher().wins())
                                            .losses(request.pitcher().losses())
                                            .saves(request.pitcher().saves())
                                            .holds(request.pitcher().holds())
                                            .build()
                            )
                    );
        } else {
            pitcherRecordRepository.deleteByGameId(gameId);
        }

        GameBatterResponse batterResponse = batterRecordRepository.findByGameIdAndUserId(gameId, userId)
                .map(this::toBatterResponse)
                .orElse(null);
        GamePitcherResponse pitcherResponse = pitcherRecordRepository.findByGameId(gameId)
                .map(this::toPitcherResponse)
                .orElse(null);

        return toDetailResponse(savedGame, batterResponse, pitcherResponse);
    }

    @Transactional
    public void delete(long gameId) {
        long userId = currentUserProvider.getCurrentUserId();
        if (!gameRecordRepository.existsByIdAndUserId(gameId, userId)) {
            throw new GameNotFoundException(gameId);
        }
        gameRecordRepository.deleteById(gameId);
    }

    private ParticipationType resolveParticipationType(GameCreateRequest request) {
        return ParticipationType.BATTER;
    }

    private ParticipationType resolveParticipationType(GameUpdateRequest request) {
        if (request.batter() != null && request.pitcher() != null) {
            return ParticipationType.BOTH;
        }
        if (request.batter() != null) {
            return ParticipationType.BATTER;
        }
        return ParticipationType.PITCHER;
    }

    private void validateImmutableFields(GameRecord game, GameUpdateInfoRequest gameInfo) {
        if (gameInfo.gameType() != null && !game.gameType().equals(gameInfo.gameType())) {
            throw new GameImmutableFieldException("gameType");
        }
    }

    private LocalDateTime resolvePlayedAt(GameRecord game, GameUpdateInfoRequest gameInfo) {
        LocalDateTime existingPlayedAt = game.playedAt();
        var playedDate = gameInfo.playedDate() != null ? gameInfo.playedDate() : existingPlayedAt.toLocalDate();
        int playedHour = gameInfo.playedHour() != null ? gameInfo.playedHour() : existingPlayedAt.getHour();
        int playedMinute = gameInfo.playedMinute() != null ? gameInfo.playedMinute() : existingPlayedAt.getMinute();
        return LocalDateTime.of(playedDate, LocalTime.of(playedHour, playedMinute));
    }

    private GameDetailResponse toDetailResponse(
            GameRecord game,
            GameBatterResponse batterResponse,
            GamePitcherResponse pitcherResponse
    ) {
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
                batterResponse,
                pitcherResponse
        );
    }

    private GameBatterResponse toBatterResponse(BatterRecord record) {
        return new GameBatterResponse(
                record.plateAppearances(),
                record.atBats(),
                record.singles(),
                record.doubles(),
                record.triples(),
                record.homeRuns(),
                record.walks(),
                record.strikeOuts(),
                record.hitByPitch(),
                record.runsBattedIn(),
                record.runs(),
                record.stolenBases(),
                record.caughtStealing(),
                record.sacrificeHits()
        );
    }

    private GamePitcherResponse toPitcherResponse(PitcherRecord record) {
        return new GamePitcherResponse(
                record.innings(),
                record.additionalOuts(),
                record.runsAllowed(),
                record.earnedRuns(),
                record.hitsAllowed(),
                record.walks(),
                record.hitByPitch(),
                record.homeRunsAllowed(),
                record.strikeOuts(),
                record.battersFaced(),
                record.wins(),
                record.losses(),
                record.saves(),
                record.holds()
        );
    }

    private String normalizeOptionalName(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim();
    }

    private void validateCreateRequest(GameCreateRequest request) {
        LocalDateTime playedAt = LocalDateTime.of(
                request.playedDate(),
                java.time.LocalTime.of(request.playedHour(), request.playedMinute())
        );
        LocalDateTime now = LocalDateTime.now(clock);
        if (playedAt.isAfter(now)) {
            throw new InvalidGameCreateException("playedAt", "future playedAt is not allowed.");
        }
        if (request.walksAndHitByPitch() > request.plateAppearances()) {
            throw new InvalidGameCreateException("walksAndHitByPitch", "walksAndHitByPitch must not exceed plateAppearances.");
        }
        int atBats = request.plateAppearances() - request.walksAndHitByPitch();
        int hits = request.singles() + request.doubles() + request.triples() + request.homeRuns();
        if (hits > atBats) {
            throw new InvalidGameCreateException("hits", "hits must not exceed atBats.");
        }
    }

    private GameDetailResponse toMilestoneCreateDetail(GameRecord game, BatterRecord batter) {
        int hits = batter.singles() + batter.doubles() + batter.triples() + batter.homeRuns();
        int totalBases = batter.singles() + (batter.doubles() * 2) + (batter.triples() * 3) + (batter.homeRuns() * 4);
        double battingAverage = divideOrZero(hits, batter.atBats());
        double onBasePercentage = divideOrZero(hits + batter.walks() + batter.hitByPitch(), batter.plateAppearances());
        double sluggingPercentage = divideOrZero(totalBases, batter.atBats());
        double ops = onBasePercentage + sluggingPercentage;

        return new GameDetailResponse(
                game.id(),
                game.playedAt().toLocalDate(),
                game.playedAt().getHour(),
                game.playedAt().getMinute(),
                DateTimeFormatter.ofPattern("M/d HH:mm").format(game.playedAt()),
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
                round3(ops)
        );
    }

    private double divideOrZero(int numerator, int denominator) {
        if (denominator == 0) {
            return 0.0;
        }
        return (double) numerator / denominator;
    }

    private double round3(double value) {
        return Math.round(value * 1000) / 1000.0;
    }
}
