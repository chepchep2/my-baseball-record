package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.dto.game.response.GameBatterResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameDetailResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GameInfoResponse;
import com.chepchep2.mybaseballrecord.dto.game.response.GamePitcherResponse;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.PitcherRecordRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.springframework.stereotype.Service;

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
}
