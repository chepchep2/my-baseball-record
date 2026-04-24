package com.chepchep2.mybaseballrecord.domain.game;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_record")
public class GameRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt;

    @Column(name = "season_year", nullable = false)
    private Integer seasonYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false, length = 20)
    private GameType gameType;

    @Column(name = "team_name", nullable = false, length = 100)
    private String teamName;

    @Column(name = "opponent_name", nullable = false, length = 100)
    private String opponentName;

    @Column(name = "memo", length = 1000)
    private String memo;

    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "participation_type", nullable = false, length = 20)
    private ParticipationType participationType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Builder
    public GameRecord(
            LocalDateTime playedAt,
            Integer seasonYear,
            GameType gameType,
            String teamName,
            String opponentName,
            String memo,
            Long userId,
            ParticipationType participationType
    ) {
        this.playedAt = playedAt;
        this.seasonYear = seasonYear;
        this.gameType = gameType;
        this.teamName = teamName;
        this.opponentName = opponentName;
        this.memo = memo;
        this.userId = userId;
        this.participationType = participationType;
    }

    protected GameRecord() {
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long id() {
        return id;
    }

    public LocalDateTime playedAt() {
        return playedAt;
    }

    public Integer seasonYear() {
        return seasonYear;
    }

    public GameType gameType() {
        return gameType;
    }

    public String teamName() {
        return teamName;
    }

    public String opponentName() {
        return opponentName;
    }

    public String memo() {
        return memo;
    }

    public Long userId() {
        return userId;
    }

    public ParticipationType participationType() {
        return participationType;
    }

    public void updateMutableFields(
            LocalDateTime playedAt,
            Integer seasonYear,
            String teamName,
            String opponentName,
            String memo,
            ParticipationType participationType
    ) {
        this.playedAt = playedAt;
        this.seasonYear = seasonYear;
        this.teamName = teamName;
        this.opponentName = opponentName;
        this.memo = memo;
        this.participationType = participationType;
    }
}
