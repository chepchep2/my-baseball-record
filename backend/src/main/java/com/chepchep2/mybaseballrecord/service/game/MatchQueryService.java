package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.auth.User;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecordVerification;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.Stadium;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidateItemResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidatesResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchDetailResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchListItemResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchListResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchRecordDetailResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchRecordItemResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchStadiumSuggestionItemResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchStadiumSuggestionsResponse;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.repository.auth.UserRepository;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordVerificationRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.StadiumRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MatchQueryService {
    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final BatterRecordVerificationRepository batterRecordVerificationRepository;
    private final UserRepository userRepository;
    private final StadiumRepository stadiumRepository;
    private final CurrentUserProvider currentUserProvider;

    public MatchQueryService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            BatterRecordVerificationRepository batterRecordVerificationRepository,
            UserRepository userRepository,
            StadiumRepository stadiumRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.gameRecordRepository = gameRecordRepository;
        this.batterRecordRepository = batterRecordRepository;
        this.batterRecordVerificationRepository = batterRecordVerificationRepository;
        this.userRepository = userRepository;
        this.stadiumRepository = stadiumRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public MatchCandidatesResponse findCandidates(
            LocalDate playedDate,
            int playedHour,
            int playedMinute,
            String cityName,
            String districtName,
            boolean expandScope
    ) {
        LocalDateTime target = LocalDateTime.of(playedDate, LocalTime.of(playedHour, playedMinute));
        LocalDateTime start = target.minusMinutes(30);
        LocalDateTime end = target.plusMinutes(30);
        List<GameRecord> games = expandScope
                ? gameRecordRepository.findMatchCandidatesByCity(start, end, cityName)
                : gameRecordRepository.findMatchCandidatesByCityAndDistrict(start, end, cityName, districtName);

        return new MatchCandidatesResponse(games.stream().map(this::toCandidate).toList(), expandScope);
    }

    public MatchListResponse getMatches() {
        long currentUserId = currentUserProvider.getCurrentUserId();
        List<GameRecord> games = gameRecordRepository.findVisibleByUserIdOrderByPlayedAtDesc(currentUserId, org.springframework.data.domain.Pageable.unpaged());
        Map<Long, BatterRecord> myRecordsByGameId = batterRecordRepository.findAllByUserIdAndGameIdIn(
                currentUserId,
                games.stream().map(GameRecord::id).toList()
        ).stream().collect(Collectors.toMap(BatterRecord::gameId, Function.identity()));

        List<MatchListItemResponse> items = games.stream()
                .filter(game -> myRecordsByGameId.containsKey(game.id()))
                .map(game -> toMatchListItem(game, myRecordsByGameId.get(game.id())))
                .toList();

        return new MatchListResponse(items);
    }

    public MatchStadiumSuggestionsResponse getStadiumSuggestions(String cityName, String districtName) {
        List<Stadium> stadiums = stadiumRepository.findAllByCityNameAndDistrictNameOrderByStadiumNameAsc(
                cityName.trim(),
                districtName.trim()
        );
        return new MatchStadiumSuggestionsResponse(
                stadiums.stream()
                        .map(stadium -> new MatchStadiumSuggestionItemResponse(stadium.id(), stadium.stadiumName()))
                        .toList()
        );
    }

    public MatchDetailResponse getDetail(long gameId) {
        long currentUserId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException(gameId));
        List<BatterRecord> records = batterRecordRepository.findAllByGameId(gameId);
        List<Long> recordIds = records.stream().map(BatterRecord::id).toList();
        Set<Long> verifiedIds = recordIds.isEmpty()
                ? Set.of()
                : batterRecordVerificationRepository.findAllByBatterRecordIdIn(recordIds).stream()
                        .map(BatterRecordVerification::batterRecordId)
                        .collect(Collectors.toCollection(HashSet::new));
        Map<Long, User> usersById = userRepository.findAllById(
                records.stream().map(BatterRecord::userId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::id, Function.identity()));

        return new MatchDetailResponse(
                game.id(),
                game.playedAt().toLocalDate(),
                game.playedAt().getHour(),
                game.playedAt().getMinute(),
                game.playedAt().format(DateTimeFormatter.ofPattern("M/d HH:mm")),
                game.cityName(),
                game.districtName(),
                game.stadiumNameSnapshot(),
                currentUserId == nullSafe(game.createdByUserId()),
                records.stream().anyMatch(record -> currentUserId == nullSafe(record.userId())),
                records.stream().map(record -> toRecordItem(record, usersById.get(record.userId()), verifiedIds.contains(record.id()))).toList()
        );
    }

    public MatchRecordDetailResponse getRecordDetail(long gameId, long batterRecordId) {
        GameRecord game = gameRecordRepository.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException(gameId));
        BatterRecord record = batterRecordRepository.findById(batterRecordId)
                .orElseThrow(() -> new GameNotFoundException(gameId));
        if (!record.gameId().equals(game.id())) {
            throw new GameNotFoundException(gameId);
        }

        User user = record.userId() == null
                ? null
                : userRepository.findById(record.userId()).orElse(null);
        boolean verified = batterRecordVerificationRepository.findAllByBatterRecordIdIn(List.of(batterRecordId)).stream()
                .anyMatch(item -> item.batterRecordId().equals(batterRecordId));

        int hits = record.singles() + record.doubles() + record.triples() + record.homeRuns();
        int walksAndHitByPitch = record.walks() + record.hitByPitch();
        double onBasePercentage = ratio(hits + walksAndHitByPitch, record.atBats() + walksAndHitByPitch + record.sacrificeHits());
        double sluggingPercentage = ratio(
                record.singles() + (record.doubles() * 2) + (record.triples() * 3) + (record.homeRuns() * 4),
                record.atBats()
        );
        double ops = onBasePercentage + sluggingPercentage;
        return new MatchRecordDetailResponse(
                record.id(),
                game.id(),
                nullSafe(record.userId()),
                user == null ? "알 수 없음" : user.displayName(),
                verified,
                game.playedAt().toLocalDate().toString(),
                game.playedAt().getHour(),
                game.playedAt().getMinute(),
                record.plateAppearances(),
                record.atBats(),
                record.singles(),
                record.doubles(),
                record.triples(),
                record.homeRuns(),
                record.walks(),
                record.strikeOuts(),
                record.hitByPitch(),
                record.runsBattedIn(),
                record.runs(),
                record.stolenBases(),
                record.caughtStealing(),
                record.sacrificeHits(),
                hits,
                walksAndHitByPitch,
                formatDecimal(ratio(hits, record.atBats()), 3),
                formatDecimal(onBasePercentage, 3),
                formatDecimal(sluggingPercentage, 3),
                formatDecimal(ops, 3)
        );
    }

    private MatchCandidateItemResponse toCandidate(GameRecord game) {
        return new MatchCandidateItemResponse(
                game.id(),
                game.playedAt().toLocalDate(),
                game.playedAt().getHour(),
                game.playedAt().getMinute(),
                game.playedAt().format(DateTimeFormatter.ofPattern("M/d HH:mm")),
                game.cityName(),
                game.districtName(),
                game.stadiumNameSnapshot()
        );
    }

    private MatchListItemResponse toMatchListItem(GameRecord game, BatterRecord record) {
        int hits = record.singles() + record.doubles() + record.triples() + record.homeRuns();
        boolean verified = !batterRecordVerificationRepository.findAllByBatterRecordIdIn(List.of(record.id())).isEmpty();
        return new MatchListItemResponse(
                game.id(),
                record.id(),
                verified,
                game.playedAt().toLocalDate().toString(),
                game.playedAt().format(DateTimeFormatter.ofPattern("M/d HH:mm")),
                "타석 " + record.plateAppearances() + " · 안타 " + hits + " · 타율 " + formatDecimal(ratio(hits, record.atBats()), 3)
        );
    }

    private MatchRecordItemResponse toRecordItem(BatterRecord record, User user, boolean verified) {
        int hits = record.singles() + record.doubles() + record.triples() + record.homeRuns();
        return new MatchRecordItemResponse(
                record.id(),
                nullSafe(record.userId()),
                user == null ? "알 수 없음" : user.displayName(),
                record.plateAppearances(),
                hits,
                formatDecimal(ratio(hits, record.atBats()), 3),
                verified
        );
    }

    private long nullSafe(Long value) {
        return value == null ? -1L : value;
    }

    private double ratio(int numerator, int denominator) {
        if (denominator == 0) {
            return 0.0;
        }
        return (double) numerator / denominator;
    }

    private String formatDecimal(double value, int scale) {
        return BigDecimal.valueOf(value)
                .setScale(scale, RoundingMode.HALF_UP)
                .toPlainString();
    }
}
