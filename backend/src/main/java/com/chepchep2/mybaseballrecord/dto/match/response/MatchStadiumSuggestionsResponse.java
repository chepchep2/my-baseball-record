package com.chepchep2.mybaseballrecord.dto.match.response;

import java.util.List;

public record MatchStadiumSuggestionsResponse(
        List<MatchStadiumSuggestionItemResponse> items
) {
}
