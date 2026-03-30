package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGamesResponse;
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
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameRecentQueryServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private PitcherRecordRepository pitcherRecordRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private GameQueryService gameQueryService;

    @Test
    @DisplayName("최근 경기 목록은 현재 사용자 기준 playedAt desc로 반환한다")
    void getRecentReturnsOrderedItems() throws Exception {
        GameRecord newer = createGame(101L, LocalDateTime.parse("2026-03-27T19:00:00"));
        GameRecord older = createGame(100L, LocalDateTime.parse("2026-03-20T14:10:00"));

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByUserIdOrderByPlayedAtDesc(1L, PageRequest.of(0, 3))).thenReturn(List.of(newer, older));
        when(batterRecordRepository.findByGameId(101L)).thenReturn(Optional.of(createBatter(101L, 5, 4, 2, 0, 0, 1, 1)));
        when(batterRecordRepository.findByGameId(100L)).thenReturn(Optional.of(createBatter(100L, 4, 4, 1, 1, 0, 0, 0)));

        RecentGamesResponse response = gameQueryService.getRecent(3);

        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).gameId()).isEqualTo(101L);
        assertThat(response.items().get(0).playedDate()).isEqualTo("2026-03-27");
        assertThat(response.items().get(0).ops()).isEqualTo("2.300");
        assertThat(response.items().get(1).gameId()).isEqualTo(100L);
    }

    private GameRecord createGame(long id, LocalDateTime playedAt) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(playedAt)
                .seasonYear(playedAt.getYear())
                .gameType(GameType.LEAGUE)
                .teamName("")
                .opponentName("")
                .memo(null)
                .userId(1L)
                .participationType(ParticipationType.BATTER)
                .build();
        var idField = GameRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(game, id);
        return game;
    }

    private BatterRecord createBatter(long gameId, int plateAppearances, int atBats, int singles, int doubles, int triples, int homeRuns, int walks) {
        return BatterRecord.builder()
                .gameId(gameId)
                .plateAppearances(plateAppearances)
                .atBats(atBats)
                .singles(singles)
                .doubles(doubles)
                .triples(triples)
                .homeRuns(homeRuns)
                .walks(walks)
                .strikeOuts(0)
                .hitByPitch(0)
                .runsBattedIn(0)
                .runs(0)
                .stolenBases(0)
                .caughtStealing(0)
                .sacrificeHits(0)
                .build();
    }
}
