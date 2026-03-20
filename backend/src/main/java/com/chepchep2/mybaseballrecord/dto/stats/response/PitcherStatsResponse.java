package com.chepchep2.mybaseballrecord.dto.stats.response;

import com.chepchep2.mybaseballrecord.domain.stats.StatsGameFilter;
import com.chepchep2.mybaseballrecord.domain.stats.StatsRecordType;
import com.chepchep2.mybaseballrecord.domain.stats.StatsScope;

public record PitcherStatsResponse(
        StatsScope scope,
        Integer seasonYear,
        StatsRecordType recordType,
        StatsGameFilter gameFilter,
        PitcherStatsSummary summary,
        PitcherStatsDetails details,
        boolean isEmpty
) {
}
