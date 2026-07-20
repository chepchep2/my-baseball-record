package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.Stadium;
import com.chepchep2.mybaseballrecord.dto.match.request.MatchCreateRequest;
import com.chepchep2.mybaseballrecord.dto.match.request.MatchRecordCreateRequest;
import com.chepchep2.mybaseballrecord.exception.game.MatchVerificationNotAllowedException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordVerificationRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.StadiumRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchCommandServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private StadiumRepository stadiumRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private BatterRecordVerificationRepository batterRecordVerificationRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Mock
    private StadiumNameNormalizer stadiumNameNormalizer;

    @InjectMocks
    private MatchCommandService matchCommandService;

    @Test
    @DisplayName("새 경기 생성은 기존 normalized stadium이 있으면 재사용한다")
    void createMatchReusesExistingStadium() throws Exception {
        MatchCreateRequest request = new MatchCreateRequest(
                LocalDate.parse("2026-05-20"),
                10,
                30,
                "부산시",
                "강서구",
                null,
                "맥도 A"
        );
        Stadium existingStadium = Stadium.builder()
                .cityName("부산시")
                .districtName("강서구")
                .stadiumName("맥도A")
                .normalizedName("맥도a")
                .createdByUserId(9L)
                .build();
        setId(existingStadium, Stadium.class, 71L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(stadiumNameNormalizer.normalize("맥도 A")).thenReturn("맥도a");
        when(stadiumRepository.findByCityNameAndDistrictNameAndNormalizedName("부산시", "강서구", "맥도a"))
                .thenReturn(java.util.Optional.of(existingStadium));
        when(gameRecordRepository.save(any())).thenAnswer(invocation -> {
            GameRecord game = invocation.getArgument(0);
            setId(game, GameRecord.class, 91L);
            return game;
        });

        var response = matchCommandService.create(request);

        ArgumentCaptor<GameRecord> gameCaptor = ArgumentCaptor.forClass(GameRecord.class);
        verify(gameRecordRepository).save(gameCaptor.capture());

        assertThat(gameCaptor.getValue().createdByUserId()).isEqualTo(1L);
        assertThat(gameCaptor.getValue().cityName()).isEqualTo("부산시");
        assertThat(gameCaptor.getValue().districtName()).isEqualTo("강서구");
        assertThat(gameCaptor.getValue().stadiumId()).isEqualTo(71L);
        assertThat(gameCaptor.getValue().stadiumNameSnapshot()).isEqualTo("맥도A");
        assertThat(response.gameId()).isEqualTo(91L);
        assertThat(response.stadiumName()).isEqualTo("맥도A");
    }

    @Test
    @DisplayName("기록 생성은 해당 경기 아래 현재 사용자 batter record를 추가한다")
    void createRecordAddsBatterRecordToExistingMatch() throws Exception {
        MatchRecordCreateRequest request = new MatchRecordCreateRequest(5, 1, 1, 1, 0, 0, 1, 1);
        GameRecord game = gameWithId(21L, 9L, "부산시", "강서구", "맥도A");

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findByGameIdAndUserId(21L, 1L)).thenReturn(Optional.empty());

        matchCommandService.createRecord(21L, request);

        ArgumentCaptor<BatterRecord> batterCaptor = ArgumentCaptor.forClass(BatterRecord.class);
        verify(batterRecordRepository).save(batterCaptor.capture());
        assertThat(batterCaptor.getValue().gameId()).isEqualTo(21L);
        assertThat(batterCaptor.getValue().userId()).isEqualTo(1L);
        assertThat(batterCaptor.getValue().plateAppearances()).isEqualTo(5);
        assertThat(batterCaptor.getValue().atBats()).isEqualTo(2);
        assertThat(batterCaptor.getValue().walks()).isEqualTo(1);
        assertThat(batterCaptor.getValue().sacrificeBunts()).isEqualTo(1);
        assertThat(batterCaptor.getValue().sacrificeFlies()).isEqualTo(1);
    }

    @Test
    @DisplayName("인증된 기록을 수정하면 기존 인증이 해제된다")
    void updateRecordClearsExistingVerification() throws Exception {
        MatchRecordCreateRequest request = new MatchRecordCreateRequest(4, 0, 3, 0, 0, 0, 1, 0);
        GameRecord game = gameWithId(21L, 9L, "부산시", "강서구", "맥도A");
        BatterRecord target = batterWithId(31L, 21L, 1L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findById(31L)).thenReturn(Optional.of(target));

        matchCommandService.updateRecord(21L, 31L, request);

        verify(batterRecordVerificationRepository).deleteByBatterRecordId(31L);
        assertThat(target.plateAppearances()).isEqualTo(4);
        assertThat(target.atBats()).isEqualTo(3);
        assertThat(target.singles()).isEqualTo(3);
        assertThat(target.sacrificeBunts()).isEqualTo(1);
        assertThat(target.sacrificeFlies()).isZero();
    }

    @Test
    @DisplayName("참여자가 자기 기록을 삭제하면 해당 경기에서 본인이 남긴 인증도 해제된다")
    void deleteRecordClearsVerificationsMadeByParticipant() throws Exception {
        GameRecord game = gameWithId(21L, 9L, "부산시", "강서구", "맥도A");
        BatterRecord myRecord = batterWithId(41L, 21L, 1L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findById(41L)).thenReturn(Optional.of(myRecord));

        matchCommandService.deleteRecord(21L, 41L);

        verify(batterRecordVerificationRepository).deleteByBatterRecordId(41L);
        verify(batterRecordVerificationRepository).deleteByGameIdAndVerifiedByUserId(21L, 1L);
        verify(batterRecordRepository).delete(myRecord);
    }

    @Test
    @DisplayName("경기 생성자가 자기 기록을 삭제해도 생성자 자격으로 남긴 인증은 유지된다")
    void deleteRecordKeepsVerificationsMadeByCreator() throws Exception {
        GameRecord game = gameWithId(21L, 1L, "부산시", "강서구", "맥도A");
        BatterRecord creatorRecord = batterWithId(41L, 21L, 1L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findById(41L)).thenReturn(Optional.of(creatorRecord));

        matchCommandService.deleteRecord(21L, 41L);

        verify(batterRecordVerificationRepository).deleteByBatterRecordId(41L);
        verify(batterRecordVerificationRepository, never()).deleteByGameIdAndVerifiedByUserId(21L, 1L);
        verify(batterRecordRepository).delete(creatorRecord);
    }

    @Test
    @DisplayName("기록 인증은 경기 생성자가 다른 사람 기록을 인증할 수 있다")
    void verifyRecordAllowsCreator() throws Exception {
        GameRecord game = gameWithId(21L, 9L, "부산시", "강서구", "맥도A");
        BatterRecord target = batterWithId(31L, 21L, 2L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(9L);
        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findById(31L)).thenReturn(Optional.of(target));
        when(batterRecordVerificationRepository.existsByBatterRecordIdAndVerifiedByUserId(31L, 9L)).thenReturn(false);

        matchCommandService.verifyRecord(21L, 31L);

        verify(batterRecordVerificationRepository).save(any());
    }

    @Test
    @DisplayName("기록 인증은 생성자도 참여자도 아닌 사용자는 할 수 없다")
    void verifyRecordRejectsOutsider() throws Exception {
        GameRecord game = gameWithId(21L, 9L, "부산시", "강서구", "맥도A");
        BatterRecord target = batterWithId(31L, 21L, 2L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(7L);
        when(gameRecordRepository.findById(21L)).thenReturn(Optional.of(game));
        when(batterRecordRepository.findById(31L)).thenReturn(Optional.of(target));
        when(batterRecordRepository.findByGameIdAndUserId(21L, 7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> matchCommandService.verifyRecord(21L, 31L))
                .isInstanceOf(MatchVerificationNotAllowedException.class);
    }

    private GameRecord gameWithId(
            long id,
            long createdByUserId,
            String cityName,
            String districtName,
            String stadiumName
    ) throws Exception {
        GameRecord game = GameRecord.builder()
                .playedAt(LocalDateTime.parse("2026-05-20T10:30:00"))
                .seasonYear(2026)
                .gameType(com.chepchep2.mybaseballrecord.domain.game.GameType.LEAGUE)
                .teamName("")
                .opponentName("")
                .memo(null)
                .userId(createdByUserId)
                .createdByUserId(createdByUserId)
                .cityName(cityName)
                .districtName(districtName)
                .stadiumNameSnapshot(stadiumName)
                .participationType(com.chepchep2.mybaseballrecord.domain.game.ParticipationType.BATTER)
                .build();
        setId(game, GameRecord.class, id);
        return game;
    }

    private BatterRecord batterWithId(long id, long gameId, long userId) throws Exception {
        BatterRecord batter = BatterRecord.builder()
                .gameId(gameId)
                .userId(userId)
                .plateAppearances(4)
                .atBats(3)
                .singles(1)
                .doubles(0)
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
