package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.PitcherRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PitcherRecordRepository extends JpaRepository<PitcherRecord, Long> {
    Optional<PitcherRecord> findByGameId(Long gameId);

    List<PitcherRecord> findAllByGameIdIn(List<Long> gameIds);

    void deleteByGameId(Long gameId);
}
