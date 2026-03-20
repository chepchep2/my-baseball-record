package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class GameRepositoryTest {

    @Autowired
    private GameRecordRepository gameRecordRepository;

    @Autowired
    private BatterRecordRepository batterRecordRepository;

    @Autowired
    private PitcherRecordRepository pitcherRecordRepository;

    @Test
    @DisplayName("game와 batter를 저장 후 gameId로 조회할 수 있다")
    void saveGameAndBatter() {
        GameRecord game = gameRecordRepository.save(
                new GameRecord(
                        LocalDate.parse("2026-03-18"),
                        2026,
                        GameType.LEAGUE,
                        "블루스톰",
                        "레전드",
                        "메모",
                        ParticipationType.BATTER
                )
        );
        batterRecordRepository.save(new BatterRecord(game.id(), 4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0));

        var found = batterRecordRepository.findByGameId(game.id());

        assertThat(found).isPresent();
        assertThat(found.get().homeRuns()).isEqualTo(1);
    }

    @Test
    @DisplayName("game와 pitcher를 저장 후 gameId로 조회할 수 있다")
    void saveGameAndPitcher() {
        GameRecord game = gameRecordRepository.save(
                new GameRecord(
                        LocalDate.parse("2026-03-19"),
                        2026,
                        GameType.NON_OFFICIAL,
                        "블루스톰",
                        "레전드",
                        null,
                        ParticipationType.PITCHER
                )
        );
        pitcherRecordRepository.save(new PitcherRecord(game.id(), 1, 0, 0, 0, 1, 0, 0, 0, 2, 4, 0, 0, 0, 0));

        var found = pitcherRecordRepository.findByGameId(game.id());

        assertThat(found).isPresent();
        assertThat(found.get().strikeOuts()).isEqualTo(2);
    }

    @Test
    @DisplayName("game 삭제 시 하위 batter/pitcher 기록도 함께 삭제된다")
    void deleteGameCascadesChildRecords() {
        GameRecord game = gameRecordRepository.save(
                new GameRecord(
                        LocalDate.parse("2026-03-20"),
                        2026,
                        GameType.LEAGUE,
                        "블루스톰",
                        "레전드",
                        "삭제 테스트",
                        ParticipationType.BOTH
                )
        );
        batterRecordRepository.save(new BatterRecord(game.id(), 4, 3, 1, 1, 0, 1, 1, 0, 0, 3, 2, 0, 0, 0));
        pitcherRecordRepository.save(new PitcherRecord(game.id(), 1, 0, 0, 0, 1, 0, 0, 0, 2, 4, 0, 0, 0, 0));

        gameRecordRepository.deleteById(game.id());
        gameRecordRepository.flush();

        assertThat(batterRecordRepository.findByGameId(game.id())).isEmpty();
        assertThat(pitcherRecordRepository.findByGameId(game.id())).isEmpty();
    }
}
