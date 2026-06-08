package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecordVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BatterRecordVerificationRepository extends JpaRepository<BatterRecordVerification, Long> {
    List<BatterRecordVerification> findAllByBatterRecordIdIn(List<Long> batterRecordIds);

    boolean existsByBatterRecordIdAndVerifiedByUserId(long batterRecordId, long verifiedByUserId);

    void deleteByBatterRecordId(long batterRecordId);

    @Modifying
    @Query("""
            delete from BatterRecordVerification verification
            where verification.verifiedByUserId = :verifiedByUserId
              and verification.batterRecordId in (
                  select batter.id
                  from BatterRecord batter
                  where batter.gameId = :gameId
              )
            """)
    void deleteByGameIdAndVerifiedByUserId(
            @Param("gameId") long gameId,
            @Param("verifiedByUserId") long verifiedByUserId
    );
}
