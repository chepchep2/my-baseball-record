package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {
    List<GameRecord> findAllBySeasonYear(Integer seasonYear);

    List<GameRecord> findAllByUserId(Long userId);

    List<GameRecord> findAllByUserIdAndSeasonYear(Long userId, Integer seasonYear);

    List<GameRecord> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);

    List<GameRecord> findByUserIdOrderByPlayedAtDesc(Long userId);

    List<GameRecord> findByUserIdAndPlayedAtBetweenOrderByPlayedAtDesc(
            Long userId,
            java.time.LocalDateTime startInclusive,
            java.time.LocalDateTime endExclusive
    );

    @Query("""
            select distinct g
            from GameRecord g
            where g.userId = :userId
               or exists (
                    select 1
                    from BatterRecord b
                    where b.gameId = g.id
                      and b.userId = :userId
               )
            """)
    List<GameRecord> findAllVisibleByUserId(@Param("userId") Long userId);

    @Query("""
            select distinct g
            from GameRecord g
            where g.seasonYear = :seasonYear
              and (
                    g.userId = :userId
                    or exists (
                        select 1
                        from BatterRecord b
                        where b.gameId = g.id
                          and b.userId = :userId
                    )
              )
            """)
    List<GameRecord> findAllVisibleByUserIdAndSeasonYear(
            @Param("userId") Long userId,
            @Param("seasonYear") Integer seasonYear
    );

    @Query("""
            select distinct g
            from GameRecord g
            where (
                    g.userId = :userId
                    or exists (
                        select 1
                        from BatterRecord b
                        where b.gameId = g.id
                          and b.userId = :userId
                    )
            )
              and g.playedAt >= :startInclusive
              and g.playedAt < :endExclusive
            order by g.playedAt desc
            """)
    List<GameRecord> findVisibleByUserIdAndPlayedAtBetweenOrderByPlayedAtDesc(
            @Param("userId") Long userId,
            @Param("startInclusive") java.time.LocalDateTime startInclusive,
            @Param("endExclusive") java.time.LocalDateTime endExclusive
    );

    @Query("""
            select distinct g
            from GameRecord g
            where g.userId = :userId
               or exists (
                    select 1
                    from BatterRecord b
                    where b.gameId = g.id
                      and b.userId = :userId
               )
            order by g.playedAt desc
            """)
    List<GameRecord> findVisibleByUserIdOrderByPlayedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("""
            select g
            from GameRecord g
            where g.playedAt >= :startInclusive
              and g.playedAt <= :endInclusive
              and g.cityName = :cityName
              and g.districtName = :districtName
            order by g.playedAt asc
            """)
    List<GameRecord> findMatchCandidatesByCityAndDistrict(
            @Param("startInclusive") java.time.LocalDateTime startInclusive,
            @Param("endInclusive") java.time.LocalDateTime endInclusive,
            @Param("cityName") String cityName,
            @Param("districtName") String districtName
    );

    @Query("""
            select g
            from GameRecord g
            where g.playedAt >= :startInclusive
              and g.playedAt <= :endInclusive
              and g.cityName = :cityName
            order by g.playedAt asc
            """)
    List<GameRecord> findMatchCandidatesByCity(
            @Param("startInclusive") java.time.LocalDateTime startInclusive,
            @Param("endInclusive") java.time.LocalDateTime endInclusive,
            @Param("cityName") String cityName
    );

    Optional<GameRecord> findByIdAndUserId(Long gameId, Long userId);

    boolean existsByIdAndUserId(Long gameId, Long userId);
}
