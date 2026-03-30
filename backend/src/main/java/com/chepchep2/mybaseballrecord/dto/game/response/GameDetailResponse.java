package com.chepchep2.mybaseballrecord.dto.game.response;

import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GameDetailResponse {
    private final long gameId;
    private final LocalDate playedDate;
    private final Integer playedHour;
    private final Integer playedMinute;
    private final String playedAtLabel;
    private final Integer plateAppearances;
    private final Integer walksAndHitByPitch;
    private final Integer singles;
    private final Integer doubles;
    private final Integer triples;
    private final Integer homeRuns;
    private final Integer atBats;
    private final Integer hits;
    private final Double battingAverage;
    private final Double onBasePercentage;
    private final Double sluggingPercentage;
    private final Double ops;
    private final Long id;
    private final GameInfoResponse gameInfo;
    private final ParticipationType participationType;
    private final GameBatterResponse batter;
    private final GamePitcherResponse pitcher;

    public GameDetailResponse(
            long gameId,
            LocalDate playedDate,
            Integer playedHour,
            Integer playedMinute,
            String playedAtLabel,
            Integer plateAppearances,
            Integer walksAndHitByPitch,
            Integer singles,
            Integer doubles,
            Integer triples,
            Integer homeRuns,
            Integer atBats,
            Integer hits,
            Double battingAverage,
            Double onBasePercentage,
            Double sluggingPercentage,
            Double ops
    ) {
        this.gameId = gameId;
        this.playedDate = playedDate;
        this.playedHour = playedHour;
        this.playedMinute = playedMinute;
        this.playedAtLabel = playedAtLabel;
        this.plateAppearances = plateAppearances;
        this.walksAndHitByPitch = walksAndHitByPitch;
        this.singles = singles;
        this.doubles = doubles;
        this.triples = triples;
        this.homeRuns = homeRuns;
        this.atBats = atBats;
        this.hits = hits;
        this.battingAverage = battingAverage;
        this.onBasePercentage = onBasePercentage;
        this.sluggingPercentage = sluggingPercentage;
        this.ops = ops;
        this.id = null;
        this.gameInfo = null;
        this.participationType = null;
        this.batter = null;
        this.pitcher = null;
    }

    public GameDetailResponse(
            long id,
            GameInfoResponse gameInfo,
            ParticipationType participationType,
            GameBatterResponse batter,
            GamePitcherResponse pitcher
    ) {
        this.gameId = id;
        this.playedDate = gameInfo == null ? null : gameInfo.playedAt();
        this.playedHour = null;
        this.playedMinute = null;
        this.playedAtLabel = null;
        this.plateAppearances = batter == null ? null : batter.plateAppearances();
        this.walksAndHitByPitch = batter == null ? null : batter.walks() + batter.hitByPitch();
        this.singles = batter == null ? null : batter.singles();
        this.doubles = batter == null ? null : batter.doubles();
        this.triples = batter == null ? null : batter.triples();
        this.homeRuns = batter == null ? null : batter.homeRuns();
        this.atBats = batter == null ? null : batter.atBats();
        this.hits = batter == null ? null : batter.singles() + batter.doubles() + batter.triples() + batter.homeRuns();
        this.battingAverage = null;
        this.onBasePercentage = null;
        this.sluggingPercentage = null;
        this.ops = null;
        this.id = id;
        this.gameInfo = gameInfo;
        this.participationType = participationType;
        this.batter = batter;
        this.pitcher = pitcher;
    }

    public long gameId() {
        return gameId;
    }

    public LocalDate playedDate() {
        return playedDate;
    }

    public Integer playedHour() {
        return playedHour;
    }

    public Integer playedMinute() {
        return playedMinute;
    }

    public String playedAtLabel() {
        return playedAtLabel;
    }

    public Integer plateAppearances() {
        return plateAppearances;
    }

    public Integer walksAndHitByPitch() {
        return walksAndHitByPitch;
    }

    public Integer singles() {
        return singles;
    }

    public Integer doubles() {
        return doubles;
    }

    public Integer triples() {
        return triples;
    }

    public Integer homeRuns() {
        return homeRuns;
    }

    public Integer atBats() {
        return atBats;
    }

    public Integer hits() {
        return hits;
    }

    public Double battingAverage() {
        return battingAverage;
    }

    public Double onBasePercentage() {
        return onBasePercentage;
    }

    public Double sluggingPercentage() {
        return sluggingPercentage;
    }

    public Double ops() {
        return ops;
    }

    public long id() {
        return id == null ? gameId : id;
    }

    public GameInfoResponse gameInfo() {
        return gameInfo;
    }

    public ParticipationType participationType() {
        return participationType;
    }

    public GameBatterResponse batter() {
        return batter;
    }

    public GamePitcherResponse pitcher() {
        return pitcher;
    }

    public long getGameId() {
        return gameId;
    }

    public LocalDate getPlayedDate() {
        return playedDate;
    }

    public Integer getPlayedHour() {
        return playedHour;
    }

    public Integer getPlayedMinute() {
        return playedMinute;
    }

    public String getPlayedAtLabel() {
        return playedAtLabel;
    }

    public Integer getPlateAppearances() {
        return plateAppearances;
    }

    public Integer getWalksAndHitByPitch() {
        return walksAndHitByPitch;
    }

    public Integer getSingles() {
        return singles;
    }

    public Integer getDoubles() {
        return doubles;
    }

    public Integer getTriples() {
        return triples;
    }

    public Integer getHomeRuns() {
        return homeRuns;
    }

    public Integer getAtBats() {
        return atBats;
    }

    public Integer getHits() {
        return hits;
    }

    public Double getBattingAverage() {
        return battingAverage;
    }

    public Double getOnBasePercentage() {
        return onBasePercentage;
    }

    public Double getSluggingPercentage() {
        return sluggingPercentage;
    }

    public Double getOps() {
        return ops;
    }

    public long getId() {
        return id();
    }

    public GameInfoResponse getGameInfo() {
        return gameInfo;
    }

    public ParticipationType getParticipationType() {
        return participationType;
    }

    public GameBatterResponse getBatter() {
        return batter;
    }

    public GamePitcherResponse getPitcher() {
        return pitcher;
    }
}
