package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BatterRecordRepository extends JpaRepository<BatterRecord, Long> {
    Optional<BatterRecord> findByGameId(Long gameId);

    Optional<BatterRecord> findByGameIdAndUserId(Long gameId, Long userId);

    List<BatterRecord> findAllByGameId(Long gameId);

    List<BatterRecord> findAllByGameIdIn(List<Long> gameIds);

    List<BatterRecord> findAllByUserIdAndGameIdIn(Long userId, List<Long> gameIds);

    void deleteByGameId(Long gameId);

    void deleteByGameIdAndUserId(Long gameId, Long userId);
}
