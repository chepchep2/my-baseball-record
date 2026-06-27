package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.dto.game.response.RecentGamesResponse;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordVerificationRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.lenient;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameRecentQueryServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private BatterRecordVerificationRepository batterRecordVerificationRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private GameQueryService gameQueryService;

    @BeforeEach
    void setUp() {
        lenient().when(batterRecordVerificationRepository.findAllByBatterRecordIdIn(anyList())).thenReturn(List.of());
    }

    @Test
    @DisplayName("최근 경기 목록은 현재 사용자 기준 playedAt desc로 반환한다")
    void getRecentReturnsOrderedItems() throws Exception {
        GameRecord newer = createGame(101L, LocalDateTime.parse("2026-03-27T19:00:00"));
        GameRecord older = createGame(100L, LocalDateTime.parse("2026-03-20T14:10:00"));

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findRecordedByUserIdOrderByPlayedAtDesc(1L, PageRequest.of(0, 3))).thenReturn(List.of(newer, older));
        when(batterRecordRepository.findByGameIdAndUserId(101L, 1L)).thenReturn(Optional.of(createBatter(1001L, 101L, 5, 4, 2, 0, 0, 1, 1)));
        when(batterRecordRepository.findByGameIdAndUserId(100L, 1L)).thenReturn(Optional.of(createBatter(1000L, 100L, 4, 4, 1, 1, 0, 0, 0)));

        RecentGamesResponse response = gameQueryService.getRecent(3);

        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).gameId()).isEqualTo(101L);
        assertThat(response.items().get(0).playedDate()).isEqualTo("2026-03-27");
        assertThat(response.items().get(0).ops()).isEqualTo("2.300");
        assertThat(response.items().get(1).gameId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("전체 경기 목록은 현재 사용자와 연도/월 기준 playedAt desc로 반환한다")
    void getGamesReturnsFilteredItems() throws Exception {
        GameRecord aprilGame = createGame(201L, LocalDateTime.parse("2026-04-05T11:30:00"));

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findRecordedByUserIdAndPlayedAtBetweenOrderByPlayedAtDesc(
                1L,
                LocalDateTime.parse("2026-04-01T00:00:00"),
                LocalDateTime.parse("2026-05-01T00:00:00")
        )).thenReturn(List.of(aprilGame));
        when(batterRecordRepository.findByGameIdAndUserId(201L, 1L)).thenReturn(Optional.of(createBatter(2001L, 201L, 4, 3, 1, 0, 0, 0, 1)));

        RecentGamesResponse response = gameQueryService.getGames(2026, 4);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).gameId()).isEqualTo(201L);
        assertThat(response.items().get(0).playedDate()).isEqualTo("2026-04-05");
        assertThat(response.items().get(0).playedAtLabel()).isEqualTo("4/5 11:30");
        assertThat(response.items().get(0).ops()).isEqualTo("0.833");
    }

    @Test
    @DisplayName("최근 경기 목록은 생성자가 아닌 shared 경기 참여자도 볼 수 있다")
    void getRecentIncludesSharedGameByBatterOwner() throws Exception {
        GameRecord shared = createGame(301L, LocalDateTime.parse("2026-04-07T20:00:00"), 99L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findRecordedByUserIdOrderByPlayedAtDesc(1L, PageRequest.of(0, 5))).thenReturn(List.of(shared));
        when(batterRecordRepository.findByGameIdAndUserId(301L, 1L)).thenReturn(Optional.of(createBatter(3001L, 301L, 4, 3, 1, 0, 0, 1, 1)));

        RecentGamesResponse response = gameQueryService.getRecent(5);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).gameId()).isEqualTo(301L);
        assertThat(response.items().get(0).playedAtLabel()).isEqualTo("4/7 20:00");
    }

    @Test
    @DisplayName("최근 경기 목록은 기록 없이 생성만 한 경기를 제외한다")
    void getRecentExcludesCreatedOnlyMatchWithoutMyRecord() throws Exception {
        GameRecord createdOnly = createGame(401L, LocalDateTime.parse("2026-05-15T10:30:00"));

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findRecordedByUserIdOrderByPlayedAtDesc(1L, PageRequest.of(0, 3))).thenReturn(List.of());

        RecentGamesResponse response = gameQueryService.getRecent(3);

        assertThat(response.items()).isEmpty();
    }

    @Test
    @DisplayName("전체 경기 목록은 기록 없이 생성만 한 경기를 제외한다")
    void getGamesExcludesCreatedOnlyMatchWithoutMyRecord() throws Exception {
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findAllRecordedByUserId(1L)).thenReturn(List.of());

        RecentGamesResponse response = gameQueryService.getGames(null, null);

        assertThat(response.items()).isEmpty();
    }

    private GameRecord createGame(long id, LocalDateTime playedAt) throws Exception {
        return createGame(id, playedAt, 1L);
    }

    private GameRecord createGame(long id, LocalDateTime playedAt, long userId) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(playedAt)
                .seasonYear(playedAt.getYear())
                .gameType(GameType.LEAGUE)
                .teamName("")
                .opponentName("")
                .memo(null)
                .userId(userId)
                .participationType(ParticipationType.BATTER)
                .build();
        var idField = GameRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(game, id);
        return game;
    }

    private BatterRecord createBatter(long id, long gameId, int plateAppearances, int atBats, int singles, int doubles, int triples, int homeRuns, int walks) throws Exception {
        BatterRecord batter = BatterRecord.builder()
                .gameId(gameId)
                .userId(1L)
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
        var idField = BatterRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(batter, id);
        return batter;
    }
}
