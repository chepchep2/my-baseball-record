package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.auth.User;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecordVerification;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.Stadium;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidatesResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchDetailResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchRecordDetailResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchStadiumSuggestionsResponse;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordVerificationRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.StadiumRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchQueryServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private BatterRecordVerificationRepository batterRecordVerificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StadiumRepository stadiumRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private MatchQueryService matchQueryService;

    @Test
    @DisplayName("후보 조회는 기본적으로 같은 시/도, 구/군, ±30분 경기만 보여준다")
    void findCandidatesWithinDistrict() throws Exception {
        GameRecord game = gameWithId(
                11L,
                LocalDateTime.parse("2026-05-20T10:30:00"),
                9L,
                "부산시",
                "강서구",
                "맥도A"
        );

        when(gameRecordRepository.findMatchCandidatesByCityAndDistrict(
                LocalDateTime.parse("2026-05-20T10:00:00"),
                LocalDateTime.parse("2026-05-20T11:00:00"),
                "부산시",
                "강서구"
        )).thenReturn(List.of(game));

        MatchCandidatesResponse response = matchQueryService.findCandidates(
                LocalDate.parse("2026-05-20"),
                10,
                30,
                "부산시",
                "강서구",
                false
        );

        assertThat(response.expandedScope()).isFalse();
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).gameId()).isEqualTo(11L);
        assertThat(response.items().get(0).playedAtLabel()).isEqualTo("5/20 10:30");
        assertThat(response.items().get(0).cityName()).isEqualTo("부산시");
        assertThat(response.items().get(0).districtName()).isEqualTo("강서구");
        assertThat(response.items().get(0).stadiumName()).isEqualTo("맥도A");
    }

    @Test
    @DisplayName("경기 상세는 경기 정보와 기록 남긴 사람 목록, 내 기록 여부를 반환한다")
    void getMatchDetailReturnsRecordList() throws Exception {
        GameRecord game = gameWithId(
                21L,
                LocalDateTime.parse("2026-05-20T10:30:00"),
                9L,
                "부산시",
                "강서구",
                "맥도A"
        );
        BatterRecord mine = batterWithId(31L, 21L, 1L, 4, 3, 1, 1, 0, 0, 1);
        BatterRecord other = batterWithId(32L, 21L, 2L, 5, 4, 1, 0, 0, 1, 1);
        BatterRecordVerification verification = BatterRecordVerification.builder()
                .batterRecordId(32L)
                .verifiedByUserId(1L)
                .build();
        setId(verification, BatterRecordVerification.class, 41L);
        User me = User.existing(1L, "sub-1", "one@example.com", "조상우", "KAKAO", null);
        User another = User.existing(2L, "sub-2", "two@example.com", "김영훈", "KAKAO", null);

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findAllByGameId(21L)).thenReturn(List.of(mine, other));
        when(batterRecordVerificationRepository.findAllByBatterRecordIdIn(List.of(31L, 32L))).thenReturn(List.of(verification));
        when(userRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(me, another));

        MatchDetailResponse response = matchQueryService.getDetail(21L);

        assertThat(response.gameId()).isEqualTo(21L);
        assertThat(response.playedAtLabel()).isEqualTo("5/20 10:30");
        assertThat(response.cityName()).isEqualTo("부산시");
        assertThat(response.districtName()).isEqualTo("강서구");
        assertThat(response.stadiumName()).isEqualTo("맥도A");
        assertThat(response.createdByCurrentUser()).isFalse();
        assertThat(response.myRecordExists()).isTrue();
        assertThat(response.records()).hasSize(2);
        assertThat(response.records().get(0).displayName()).isEqualTo("조상우");
        assertThat(response.records().get(1).displayName()).isEqualTo("김영훈");
        assertThat(response.records().get(1).verified()).isTrue();
    }

    @Test
    @DisplayName("구장 추천 목록은 지역 기준 오름차순으로 반환한다")
    void getStadiumSuggestionsReturnsItems() throws Exception {
        Stadium macdoA = Stadium.builder()
                .cityName("부산시")
                .districtName("강서구")
                .stadiumName("맥도A")
                .normalizedName("맥도a")
                .createdByUserId(1L)
                .build();
        Stadium macdoB = Stadium.builder()
                .cityName("부산시")
                .districtName("강서구")
                .stadiumName("맥도B")
                .normalizedName("맥도b")
                .createdByUserId(2L)
                .build();
        setId(macdoA, Stadium.class, 71L);
        setId(macdoB, Stadium.class, 72L);

        when(stadiumRepository.findAllByCityNameAndDistrictNameOrderByStadiumNameAsc("부산시", "강서구"))
                .thenReturn(List.of(macdoA, macdoB));

        MatchStadiumSuggestionsResponse response = matchQueryService.getStadiumSuggestions("부산시", "강서구");

        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).stadiumId()).isEqualTo(71L);
        assertThat(response.items().get(0).stadiumName()).isEqualTo("맥도A");
        assertThat(response.items().get(1).stadiumId()).isEqualTo(72L);
    }

    @Test
    @DisplayName("기록 상세는 희생번트와 희생플라이를 분리하고 출루율은 희생플라이만 반영한다")
    void getRecordDetailSeparatesSacrificeStats() throws Exception {
        GameRecord game = gameWithId(
                21L,
                LocalDateTime.parse("2026-05-20T10:30:00"),
                9L,
                "부산시",
                "강서구",
                "맥도A"
        );
        BatterRecord record = BatterRecord.builder()
                .gameId(21L)
                .userId(1L)
                .plateAppearances(6)
                .atBats(3)
                .singles(1)
                .doubles(1)
                .triples(0)
                .homeRuns(0)
                .walks(1)
                .strikeOuts(0)
                .hitByPitch(0)
                .runsBattedIn(0)
                .runs(0)
                .stolenBases(0)
                .caughtStealing(0)
                .sacrificeHits(0)
                .sacrificeBunts(1)
                .sacrificeFlies(1)
                .build();
        setId(record, BatterRecord.class, 31L);
        User user = User.existing(1L, "sub-1", "one@example.com", "조상우", "KAKAO", null);

        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findById(31L)).thenReturn(Optional.of(record));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(batterRecordVerificationRepository.findAllByBatterRecordIdIn(List.of(31L))).thenReturn(List.of());

        MatchRecordDetailResponse response = matchQueryService.getRecordDetail(21L, 31L);

        assertThat(response.sacrificeBunts()).isEqualTo(1);
        assertThat(response.sacrificeFlies()).isEqualTo(1);
        assertThat(response.onBasePercentage()).isEqualTo("0.600");
    }

    private GameRecord gameWithId(
            long id,
            LocalDateTime playedAt,
            long createdByUserId,
            String cityName,
            String districtName,
            String stadiumNameSnapshot
    ) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(playedAt)
                .seasonYear(playedAt.getYear())
                .gameType(GameType.LEAGUE)
                .teamName("")
                .opponentName("")
                .memo(null)
                .userId(createdByUserId)
                .createdByUserId(createdByUserId)
                .cityName(cityName)
                .districtName(districtName)
                .stadiumNameSnapshot(stadiumNameSnapshot)
                .participationType(ParticipationType.BATTER)
                .build();
        setId(game, GameRecord.class, id);
        return game;
    }

    private BatterRecord batterWithId(
            long id,
            long gameId,
            long userId,
            int plateAppearances,
            int atBats,
            int singles,
            int doubles,
            int triples,
            int homeRuns,
            int walks
    ) throws Exception {
        BatterRecord batter = BatterRecord.builder()
                .gameId(gameId)
                .userId(userId)
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
                .sacrificeBunts(0)
                .sacrificeFlies(0)
                .build();
        setId(batter, BatterRecord.class, id);
        return batter;
    }

    private void setId(Object target, Class<?> type, long id) throws Exception {
        Field idField = type.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(target, id);
    }
}
