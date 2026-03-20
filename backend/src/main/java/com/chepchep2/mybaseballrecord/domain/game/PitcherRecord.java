package com.chepchep2.mybaseballrecord.domain.game;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pitcher_record")
public class PitcherRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "game_id", nullable = false, unique = true)
    private Long gameId;

    @Column(name = "innings", nullable = false)
    private int innings;

    @Column(name = "additional_outs", nullable = false)
    private int additionalOuts;

    @Column(name = "runs_allowed", nullable = false)
    private int runsAllowed;

    @Column(name = "earned_runs", nullable = false)
    private int earnedRuns;

    @Column(name = "hits_allowed", nullable = false)
    private int hitsAllowed;

    @Column(name = "walks", nullable = false)
    private int walks;

    @Column(name = "hit_by_pitch", nullable = false)
    private int hitByPitch;

    @Column(name = "home_runs_allowed", nullable = false)
    private int homeRunsAllowed;

    @Column(name = "strike_outs", nullable = false)
    private int strikeOuts;

    @Column(name = "batters_faced", nullable = false)
    private int battersFaced;

    @Column(name = "wins", nullable = false)
    private int wins;

    @Column(name = "losses", nullable = false)
    private int losses;

    @Column(name = "saves", nullable = false)
    private int saves;

    @Column(name = "holds", nullable = false)
    private int holds;

    public PitcherRecord(
            Long gameId,
            int innings,
            int additionalOuts,
            int runsAllowed,
            int earnedRuns,
            int hitsAllowed,
            int walks,
            int hitByPitch,
            int homeRunsAllowed,
            int strikeOuts,
            int battersFaced,
            int wins,
            int losses,
            int saves,
            int holds
    ) {
        this.gameId = gameId;
        this.innings = innings;
        this.additionalOuts = additionalOuts;
        this.runsAllowed = runsAllowed;
        this.earnedRuns = earnedRuns;
        this.hitsAllowed = hitsAllowed;
        this.walks = walks;
        this.hitByPitch = hitByPitch;
        this.homeRunsAllowed = homeRunsAllowed;
        this.strikeOuts = strikeOuts;
        this.battersFaced = battersFaced;
        this.wins = wins;
        this.losses = losses;
        this.saves = saves;
        this.holds = holds;
    }

    protected PitcherRecord() {
    }

    public Long gameId() {
        return gameId;
    }

    public int innings() {
        return innings;
    }

    public int additionalOuts() {
        return additionalOuts;
    }

    public int runsAllowed() {
        return runsAllowed;
    }

    public int earnedRuns() {
        return earnedRuns;
    }

    public int hitsAllowed() {
        return hitsAllowed;
    }

    public int walks() {
        return walks;
    }

    public int hitByPitch() {
        return hitByPitch;
    }

    public int homeRunsAllowed() {
        return homeRunsAllowed;
    }

    public int strikeOuts() {
        return strikeOuts;
    }

    public int battersFaced() {
        return battersFaced;
    }

    public int wins() {
        return wins;
    }

    public int losses() {
        return losses;
    }

    public int saves() {
        return saves;
    }

    public int holds() {
        return holds;
    }

    public void update(
            int innings,
            int additionalOuts,
            int runsAllowed,
            int earnedRuns,
            int hitsAllowed,
            int walks,
            int hitByPitch,
            int homeRunsAllowed,
            int strikeOuts,
            int battersFaced,
            int wins,
            int losses,
            int saves,
            int holds
    ) {
        this.innings = innings;
        this.additionalOuts = additionalOuts;
        this.runsAllowed = runsAllowed;
        this.earnedRuns = earnedRuns;
        this.hitsAllowed = hitsAllowed;
        this.walks = walks;
        this.hitByPitch = hitByPitch;
        this.homeRunsAllowed = homeRunsAllowed;
        this.strikeOuts = strikeOuts;
        this.battersFaced = battersFaced;
        this.wins = wins;
        this.losses = losses;
        this.saves = saves;
        this.holds = holds;
    }
}
