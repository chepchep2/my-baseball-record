package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecordVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BatterRecordVerificationRepository extends JpaRepository<BatterRecordVerification, Long> {
    List<BatterRecordVerification> findAllByBatterRecordIdIn(List<Long> batterRecordIds);

    boolean existsByBatterRecordIdAndVerifiedByUserId(long batterRecordId, long verifiedByUserId);

    void deleteByBatterRecordId(long batterRecordId);
}
