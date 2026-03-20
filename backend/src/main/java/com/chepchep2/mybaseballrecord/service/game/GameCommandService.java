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
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class GameCommandService {
    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final PitcherRecordRepository pitcherRecordRepository;
    private final CurrentUserProvider currentUserProvider;

    public GameCommandService(
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

    @Transactional
    public GameDetailResponse create(GameCreateRequest request) {
        long userId = currentUserProvider.getCurrentUserId();
        int seasonYear = request.gameInfo().seasonYear() != null
                ? request.gameInfo().seasonYear()
                : request.gameInfo().playedAt().getYear();

        ParticipationType participationType = resolveParticipationType(request);
        GameRecord savedGame = gameRecordRepository.save(
                GameRecord.builder()
                        .playedAt(request.gameInfo().playedAt())
                        .seasonYear(seasonYear)
                        .gameType(request.gameInfo().gameType())
                        .teamName(normalizeOptionalName(request.gameInfo().teamName()))
                        .opponentName(normalizeOptionalName(request.gameInfo().opponentName()))
                        .memo(request.gameInfo().memo())
                        .userId(userId)
                        .participationType(participationType)
                        .build()
        );

        GameBatterResponse batterResponse = null;
        if (request.batter() != null) {
            BatterRecord savedBatter = batterRecordRepository.save(
                    BatterRecord.builder()
                            .gameId(savedGame.id())
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
            );
            batterResponse = toBatterResponse(savedBatter);
        }

        GamePitcherResponse pitcherResponse = null;
        if (request.pitcher() != null) {
            PitcherRecord savedPitcher = pitcherRecordRepository.save(
                    PitcherRecord.builder()
                            .gameId(savedGame.id())
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
            );
            pitcherResponse = toPitcherResponse(savedPitcher);
        }

        return toDetailResponse(savedGame, batterResponse, pitcherResponse);
    }

    @Transactional
    public GameDetailResponse update(long gameId, GameUpdateRequest request) {
        long userId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findByIdAndUserId(gameId, userId)
                .orElseThrow(() -> new GameNotFoundException(gameId));

        validateImmutableFields(game, request.gameInfo());
        ParticipationType participationType = resolveParticipationType(request);
        game.updateMutableFields(
                normalizeOptionalName(request.gameInfo().teamName()),
                normalizeOptionalName(request.gameInfo().opponentName()),
                request.gameInfo().memo(),
                participationType
        );

        GameRecord savedGame = gameRecordRepository.save(game);

        if (request.batter() != null) {
            batterRecordRepository.findByGameId(gameId)
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
            batterRecordRepository.deleteByGameId(gameId);
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

        GameBatterResponse batterResponse = batterRecordRepository.findByGameId(gameId)
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
        if (request.batter() != null && request.pitcher() != null) {
            return ParticipationType.BOTH;
        }
        if (request.batter() != null) {
            return ParticipationType.BATTER;
        }
        return ParticipationType.PITCHER;
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
        if (gameInfo.playedAt() != null && !game.playedAt().equals(gameInfo.playedAt())) {
            throw new GameImmutableFieldException("playedAt");
        }
        if (gameInfo.gameType() != null && !game.gameType().equals(gameInfo.gameType())) {
            throw new GameImmutableFieldException("gameType");
        }
        if (gameInfo.seasonYear() != null && !game.seasonYear().equals(gameInfo.seasonYear())) {
            throw new GameImmutableFieldException("seasonYear");
        }
    }

    private GameDetailResponse toDetailResponse(
            GameRecord game,
            GameBatterResponse batterResponse,
            GamePitcherResponse pitcherResponse
    ) {
        return new GameDetailResponse(
                game.id(),
                new GameInfoResponse(
                        game.playedAt(),
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
}
