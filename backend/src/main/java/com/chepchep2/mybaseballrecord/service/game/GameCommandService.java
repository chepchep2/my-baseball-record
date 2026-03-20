package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.dto.game.request.GameCreateRequest;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class GameCommandService {
    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final PitcherRecordRepository pitcherRecordRepository;

    public GameCommandService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            PitcherRecordRepository pitcherRecordRepository
    ) {
        this.gameRecordRepository = gameRecordRepository;
        this.batterRecordRepository = batterRecordRepository;
        this.pitcherRecordRepository = pitcherRecordRepository;
    }

    @Transactional
    public GameDetailResponse create(GameCreateRequest request) {
        int seasonYear = request.gameInfo().seasonYear() != null
                ? request.gameInfo().seasonYear()
                : request.gameInfo().playedAt().getYear();

        ParticipationType participationType = resolveParticipationType(request);
        GameRecord savedGame = gameRecordRepository.save(
                new GameRecord(
                        request.gameInfo().playedAt(),
                        seasonYear,
                        request.gameInfo().gameType(),
                        request.gameInfo().teamName(),
                        request.gameInfo().opponentName(),
                        request.gameInfo().memo(),
                        participationType
                )
        );

        GameDetailResponse.BatterResponse batterResponse = null;
        if (request.batter() != null) {
            BatterRecord savedBatter = batterRecordRepository.save(
                    new BatterRecord(
                            savedGame.id(),
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
                    )
            );
            batterResponse = toBatterResponse(savedBatter);
        }

        GameDetailResponse.PitcherResponse pitcherResponse = null;
        if (request.pitcher() != null) {
            PitcherRecord savedPitcher = pitcherRecordRepository.save(
                    new PitcherRecord(
                            savedGame.id(),
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
                    )
            );
            pitcherResponse = toPitcherResponse(savedPitcher);
        }

        return new GameDetailResponse(
                savedGame.id(),
                new GameDetailResponse.GameInfoResponse(
                        savedGame.playedAt(),
                        savedGame.seasonYear(),
                        savedGame.gameType(),
                        savedGame.teamName(),
                        savedGame.opponentName(),
                        savedGame.memo()
                ),
                savedGame.participationType(),
                batterResponse,
                pitcherResponse
        );
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

    private GameDetailResponse.BatterResponse toBatterResponse(BatterRecord record) {
        return new GameDetailResponse.BatterResponse(
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

    private GameDetailResponse.PitcherResponse toPitcherResponse(PitcherRecord record) {
        return new GameDetailResponse.PitcherResponse(
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
}
