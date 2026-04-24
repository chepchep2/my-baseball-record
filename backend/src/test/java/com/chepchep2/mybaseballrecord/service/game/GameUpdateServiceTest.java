package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import com.chepchep2.mybaseballrecord.dto.game.request.BatterRecordRequest;
import com.chepchep2.mybaseballrecord.dto.game.request.GameUpdateInfoRequest;
import com.chepchep2.mybaseballrecord.dto.game.request.GameUpdateRequest;
import com.chepchep2.mybaseballrecord.dto.game.request.PitcherRecordRequest;
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

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameUpdateServiceTest {

    @Mock
    private GameRecordRepository gameRecordRepository;

    @Mock
    private BatterRecordRepository batterRecordRepository;

    @Mock
    private PitcherRecordRepository pitcherRecordRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private GameCommandService gameCommandService;

    @Test
    @DisplayName("날짜와 시간 변경 시 playedAt과 seasonYear를 함께 갱신한다")
    void updateSucceedsWhenPlayedAtChanged() throws Exception {
        GameRecord existing = gameWithId(
                101L,
                LocalDate.parse("2026-03-18"),
                2026,
                GameType.LEAGUE,
                "블루스톰",
                "레전드",
                "메모",
                ParticipationType.BATTER
        );
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(existing));

        GameUpdateRequest request = new GameUpdateRequest(
                new GameUpdateInfoRequest(
                        LocalDate.parse("2027-03-19"),
                        10,
                        30,
                        null,
                        GameType.LEAGUE,
                        "수정팀",
                        "수정상대",
                        "수정메모"
                ),
                new BatterRecordRequest(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                null
        );

        when(gameRecordRepository.save(any(GameRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(batterRecordRepository.findByGameId(101L)).thenReturn(Optional.of(
                new BatterRecord(101L, 4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0)
        ));
        when(pitcherRecordRepository.findByGameId(101L)).thenReturn(Optional.empty());

        var response = gameCommandService.update(101L, request);

        assertThat(response.gameInfo().playedAt()).isEqualTo(LocalDate.parse("2027-03-19"));
        assertThat(response.gameInfo().seasonYear()).isEqualTo(2027);
        assertThat(existing.playedAt()).isEqualTo(LocalDateTime.of(2027, 3, 19, 10, 30));
        assertThat(existing.seasonYear()).isEqualTo(2027);
    }

    @Test
    @DisplayName("변경 가능 필드는 수정하고 불변 필드가 같으면 성공한다")
    void updateSucceedsForMutableFields() throws Exception {
        GameRecord existing = gameWithId(
                101L,
                LocalDate.parse("2026-03-18"),
                2026,
                GameType.LEAGUE,
                "블루스톰",
                "레전드",
                "메모",
                ParticipationType.BATTER
        );
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(existing));
        when(gameRecordRepository.save(any(GameRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(batterRecordRepository.findByGameId(101L)).thenReturn(Optional.of(
                new BatterRecord(101L, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        ));
        when(pitcherRecordRepository.findByGameId(101L)).thenReturn(Optional.of(
                new PitcherRecord(101L, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        ));

        GameUpdateRequest request = new GameUpdateRequest(
                new GameUpdateInfoRequest(
                        LocalDate.parse("2026-03-18"),
                        null,
                        null,
                        2026,
                        GameType.LEAGUE,
                        "수정팀",
                        "수정상대",
                        "수정메모"
                ),
                new BatterRecordRequest(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                new PitcherRecordRequest(1, 0, 0, 0, 1, 0, 0, 0, 2, 4, 0, 0, 0, 0)
        );

        var response = gameCommandService.update(101L, request);

        assertThat(response.gameInfo().teamName()).isEqualTo("수정팀");
        assertThat(response.gameInfo().opponentName()).isEqualTo("수정상대");
        assertThat(response.participationType()).isEqualTo(ParticipationType.BOTH);
    }

    @Test
    @DisplayName("teamName이 null이면 빈 문자열로 저장한다")
    void updateStoresEmptyTeamNameWhenNull() throws Exception {
        GameRecord existing = gameWithId(
                101L,
                LocalDate.parse("2026-03-18"),
                2026,
                GameType.LEAGUE,
                "기존팀",
                "레전드",
                "메모",
                ParticipationType.BATTER
        );
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(existing));
        when(gameRecordRepository.save(any(GameRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(batterRecordRepository.findByGameId(101L)).thenReturn(Optional.of(
                new BatterRecord(101L, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        ));
        when(pitcherRecordRepository.findByGameId(101L)).thenReturn(Optional.empty());

        GameUpdateRequest request = new GameUpdateRequest(
                new GameUpdateInfoRequest(
                        LocalDate.parse("2026-03-18"),
                        null,
                        null,
                        2026,
                        GameType.LEAGUE,
                        null,
                        "수정상대",
                        "수정메모"
                ),
                new BatterRecordRequest(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                null
        );

        var response = gameCommandService.update(101L, request);

        assertThat(response.gameInfo().teamName()).isEqualTo("");
    }

    @Test
    @DisplayName("opponentName이 null이면 빈 문자열로 저장한다")
    void updateStoresEmptyOpponentNameWhenNull() throws Exception {
        GameRecord existing = gameWithId(
                101L,
                LocalDate.parse("2026-03-18"),
                2026,
                GameType.LEAGUE,
                "기존팀",
                "기존상대",
                "메모",
                ParticipationType.BATTER
        );
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(gameRecordRepository.findByIdAndUserId(101L, 1L)).thenReturn(Optional.of(existing));
        when(gameRecordRepository.save(any(GameRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(batterRecordRepository.findByGameId(101L)).thenReturn(Optional.of(
                new BatterRecord(101L, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        ));
        when(pitcherRecordRepository.findByGameId(101L)).thenReturn(Optional.empty());

        GameUpdateRequest request = new GameUpdateRequest(
                new GameUpdateInfoRequest(
                        LocalDate.parse("2026-03-18"),
                        null,
                        null,
                        2026,
                        GameType.LEAGUE,
                        "수정팀",
                        null,
                        "수정메모"
                ),
                new BatterRecordRequest(4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0),
                null
        );

        var response = gameCommandService.update(101L, request);

        assertThat(response.gameInfo().opponentName()).isEqualTo("");
    }

    private GameRecord gameWithId(
            long id,
            LocalDate playedAt,
            int seasonYear,
            GameType gameType,
            String teamName,
            String opponentName,
            String memo,
            ParticipationType participationType
    ) throws Exception {
        GameRecord game = new GameRecord(
                playedAt.atStartOfDay(),
                seasonYear,
                gameType,
                teamName,
                opponentName,
                memo,
                1L,
                participationType
        );
        Field idField = GameRecord.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(game, id);
        return game;
    }
}
