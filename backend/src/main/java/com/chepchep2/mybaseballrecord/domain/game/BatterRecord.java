package com.chepchep2.mybaseballrecord.domain.game;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;

@Entity
@Table(name = "batter_record")
public class BatterRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "game_id", nullable = false)
    private Long gameId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "plate_appearances", nullable = false)
    private int plateAppearances;

    @Column(name = "at_bats", nullable = false)
    private int atBats;

    @Column(name = "singles_count", nullable = false)
    private int singles;

    @Column(name = "doubles_count", nullable = false)
    private int doubles;

    @Column(name = "triples_count", nullable = false)
    private int triples;

    @Column(name = "home_runs", nullable = false)
    private int homeRuns;

    @Column(name = "walks", nullable = false)
    private int walks;

    @Column(name = "strike_outs", nullable = false)
    private int strikeOuts;

    @Column(name = "hit_by_pitch", nullable = false)
    private int hitByPitch;

    @Column(name = "runs_batted_in", nullable = false)
    private int runsBattedIn;

    @Column(name = "runs", nullable = false)
    private int runs;

    @Column(name = "stolen_bases", nullable = false)
    private int stolenBases;

    @Column(name = "caught_stealing", nullable = false)
    private int caughtStealing;

    @Column(name = "sacrifice_hits", nullable = false)
    private int sacrificeHits;

    @Column(name = "sacrifice_bunts", nullable = false)
    private int sacrificeBunts;

    @Column(name = "sacrifice_flies", nullable = false)
    private int sacrificeFlies;

    @Builder
    public BatterRecord(
            Long gameId,
            Long userId,
            int plateAppearances,
            int atBats,
            int singles,
            int doubles,
            int triples,
            int homeRuns,
            int walks,
            int strikeOuts,
            int hitByPitch,
            int runsBattedIn,
            int runs,
            int stolenBases,
            int caughtStealing,
            int sacrificeHits,
            int sacrificeBunts,
            int sacrificeFlies
    ) {
        this.gameId = gameId;
        this.userId = userId;
        this.plateAppearances = plateAppearances;
        this.atBats = atBats;
        this.singles = singles;
        this.doubles = doubles;
        this.triples = triples;
        this.homeRuns = homeRuns;
        this.walks = walks;
        this.strikeOuts = strikeOuts;
        this.hitByPitch = hitByPitch;
        this.runsBattedIn = runsBattedIn;
        this.runs = runs;
        this.stolenBases = stolenBases;
        this.caughtStealing = caughtStealing;
        this.sacrificeHits = sacrificeHits;
        this.sacrificeBunts = sacrificeBunts;
        this.sacrificeFlies = sacrificeFlies;
    }

    public BatterRecord(
            Long gameId,
            int plateAppearances,
            int atBats,
            int singles,
            int doubles,
            int triples,
            int homeRuns,
            int walks,
            int strikeOuts,
            int hitByPitch,
            int runsBattedIn,
            int runs,
            int stolenBases,
            int caughtStealing,
            int sacrificeHits
    ) {
        this(
                gameId,
                plateAppearances,
                atBats,
                singles,
                doubles,
                triples,
                homeRuns,
                walks,
                strikeOuts,
                hitByPitch,
                runsBattedIn,
                runs,
                stolenBases,
                caughtStealing,
                sacrificeHits,
                0,
                0
        );
    }

    public BatterRecord(
            Long gameId,
            int plateAppearances,
            int atBats,
            int singles,
            int doubles,
            int triples,
            int homeRuns,
            int walks,
            int strikeOuts,
            int hitByPitch,
            int runsBattedIn,
            int runs,
            int stolenBases,
            int caughtStealing,
            int sacrificeHits,
            int sacrificeBunts,
            int sacrificeFlies
    ) {
        this(
                gameId,
                null,
                plateAppearances,
                atBats,
                singles,
                doubles,
                triples,
                homeRuns,
                walks,
                strikeOuts,
                hitByPitch,
                runsBattedIn,
                runs,
                stolenBases,
                caughtStealing,
                sacrificeHits,
                sacrificeBunts,
                sacrificeFlies
        );
    }

    protected BatterRecord() {
    }

    public Long id() {
        return id;
    }

    public Long gameId() {
        return gameId;
    }

    public Long userId() {
        return userId;
    }

    public int plateAppearances() {
        return plateAppearances;
    }

    public int atBats() {
        return atBats;
    }

    public int singles() {
        return singles;
    }

    public int doubles() {
        return doubles;
    }

    public int triples() {
        return triples;
    }

    public int homeRuns() {
        return homeRuns;
    }

    public int walks() {
        return walks;
    }

    public int strikeOuts() {
        return strikeOuts;
    }

    public int hitByPitch() {
        return hitByPitch;
    }

    public int runsBattedIn() {
        return runsBattedIn;
    }

    public int runs() {
        return runs;
    }

    public int stolenBases() {
        return stolenBases;
    }

    public int caughtStealing() {
        return caughtStealing;
    }

    public int sacrificeHits() {
        return sacrificeHits;
    }

    public int sacrificeBunts() {
        return sacrificeBunts;
    }

    public int sacrificeFlies() {
        return sacrificeFlies;
    }

    public void update(
            int plateAppearances,
            int atBats,
            int singles,
            int doubles,
            int triples,
            int homeRuns,
            int walks,
            int strikeOuts,
            int hitByPitch,
            int runsBattedIn,
            int runs,
            int stolenBases,
            int caughtStealing,
            int sacrificeHits
    ) {
        update(
                plateAppearances,
                atBats,
                singles,
                doubles,
                triples,
                homeRuns,
                walks,
                strikeOuts,
                hitByPitch,
                runsBattedIn,
                runs,
                stolenBases,
                caughtStealing,
                sacrificeHits,
                0,
                0
        );
    }

    public void update(
            int plateAppearances,
            int atBats,
            int singles,
            int doubles,
            int triples,
            int homeRuns,
            int walks,
            int strikeOuts,
            int hitByPitch,
            int runsBattedIn,
            int runs,
            int stolenBases,
            int caughtStealing,
            int sacrificeHits,
            int sacrificeBunts,
            int sacrificeFlies
    ) {
        this.plateAppearances = plateAppearances;
        this.atBats = atBats;
        this.singles = singles;
        this.doubles = doubles;
        this.triples = triples;
        this.homeRuns = homeRuns;
        this.walks = walks;
        this.strikeOuts = strikeOuts;
        this.hitByPitch = hitByPitch;
        this.runsBattedIn = runsBattedIn;
        this.runs = runs;
        this.stolenBases = stolenBases;
        this.caughtStealing = caughtStealing;
        this.sacrificeHits = sacrificeHits;
        this.sacrificeBunts = sacrificeBunts;
        this.sacrificeFlies = sacrificeFlies;
    }
}
