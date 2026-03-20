package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {
    List<GameRecord> findAllBySeasonYear(Integer seasonYear);
}
