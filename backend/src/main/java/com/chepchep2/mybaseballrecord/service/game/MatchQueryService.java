package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.auth.User;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecordVerification;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.Stadium;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidateItemResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchCandidatesResponse;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchDetailResponse;
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
