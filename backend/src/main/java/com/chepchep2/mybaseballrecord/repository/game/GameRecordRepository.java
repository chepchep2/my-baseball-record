package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {
    List<GameRecord> findAllBySeasonYear(Integer seasonYear);

    List<GameRecord> findAllByUserId(Long userId);

    List<GameRecord> findAllByUserIdAndSeasonYear(Long userId, Integer seasonYear);

    List<GameRecord> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);

    Optional<GameRecord> findByIdAndUserId(Long gameId, Long userId);

    boolean existsByIdAndUserId(Long gameId, Long userId);
}
