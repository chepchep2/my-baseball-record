package com.chepchep2.mybaseballrecord.service.game;

import com.chepchep2.mybaseballrecord.domain.game.BatterRecord;
import com.chepchep2.mybaseballrecord.domain.game.BatterRecordVerification;
import com.chepchep2.mybaseballrecord.domain.game.GameRecord;
import com.chepchep2.mybaseballrecord.domain.game.GameType;
import com.chepchep2.mybaseballrecord.domain.game.ParticipationType;
import com.chepchep2.mybaseballrecord.domain.game.Stadium;
import com.chepchep2.mybaseballrecord.dto.match.request.MatchCreateRequest;
import com.chepchep2.mybaseballrecord.dto.match.request.MatchRecordCreateRequest;
import com.chepchep2.mybaseballrecord.dto.match.response.MatchDetailResponse;
import com.chepchep2.mybaseballrecord.exception.game.BatterRecordNotFoundException;
import com.chepchep2.mybaseballrecord.exception.game.DuplicateMatchRecordException;
import com.chepchep2.mybaseballrecord.exception.game.DuplicateMatchVerificationException;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.exception.game.InvalidGameCreateException;
import com.chepchep2.mybaseballrecord.exception.game.MatchVerificationNotAllowedException;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.BatterRecordVerificationRepository;
import com.chepchep2.mybaseballrecord.repository.game.GameRecordRepository;
import com.chepchep2.mybaseballrecord.repository.game.StadiumRepository;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MatchCommandService {
    private final GameRecordRepository gameRecordRepository;
    private final BatterRecordRepository batterRecordRepository;
    private final BatterRecordVerificationRepository batterRecordVerificationRepository;
    private final StadiumRepository stadiumRepository;
    private final CurrentUserProvider currentUserProvider;
    private final StadiumNameNormalizer stadiumNameNormalizer;

    public MatchCommandService(
            GameRecordRepository gameRecordRepository,
            BatterRecordRepository batterRecordRepository,
            BatterRecordVerificationRepository batterRecordVerificationRepository,
            StadiumRepository stadiumRepository,
            CurrentUserProvider currentUserProvider,
            StadiumNameNormalizer stadiumNameNormalizer
    ) {
        this.gameRecordRepository = gameRecordRepository;
        this.batterRecordRepository = batterRecordRepository;
        this.batterRecordVerificationRepository = batterRecordVerificationRepository;
        this.stadiumRepository = stadiumRepository;
        this.currentUserProvider = currentUserProvider;
        this.stadiumNameNormalizer = stadiumNameNormalizer;
    }

    @Transactional
    public MatchDetailResponse create(MatchCreateRequest request) {
        long currentUserId = currentUserProvider.getCurrentUserId();
        validateStadiumName(request.stadiumName());
        String normalizedName = stadiumNameNormalizer.normalize(request.stadiumName());
        Stadium stadium = stadiumRepository.findByCityNameAndDistrictNameAndNormalizedName(
                        request.cityName(),
                        request.districtName(),
                        normalizedName
                )
                .orElseGet(() -> stadiumRepository.save(
                        Stadium.builder()
                                .cityName(request.cityName().trim())
                                .districtName(request.districtName().trim())
                                .stadiumName(request.stadiumName().trim())
                                .normalizedName(normalizedName)
                                .createdByUserId(currentUserId)
                                .build()
                ));

        LocalDateTime playedAt = LocalDateTime.of(
                request.playedDate(),
                LocalTime.of(request.playedHour(), request.playedMinute())
        );

        GameRecord saved = gameRecordRepository.save(
                GameRecord.builder()
                        .playedAt(playedAt)
                        .seasonYear(request.playedDate().getYear())
                        .gameType(GameType.LEAGUE)
                        .teamName("")
                        .opponentName("")
                        .memo(null)
                        .userId(currentUserId)
                        .createdByUserId(currentUserId)
                        .cityName(request.cityName().trim())
                        .districtName(request.districtName().trim())
                        .stadiumId(stadium.id())
                        .stadiumNameSnapshot(stadium.stadiumName())
                        .participationType(ParticipationType.BATTER)
                        .build()
        );

        return new MatchDetailResponse(
                saved.id(),
                saved.playedAt().toLocalDate(),
                saved.playedAt().getHour(),
                saved.playedAt().getMinute(),
                saved.playedAt().format(DateTimeFormatter.ofPattern("M/d HH:mm")),
                saved.cityName(),
                saved.districtName(),
                saved.stadiumNameSnapshot(),
                true,
                false,
                List.of()
        );
    }

    @Transactional
    public void createRecord(long gameId, MatchRecordCreateRequest request) {
        long currentUserId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException(gameId));
        if (batterRecordRepository.findByGameIdAndUserId(gameId, currentUserId).isPresent()) {
            throw new DuplicateMatchRecordException(gameId);
        }

        int walks = request.walksAndHitByPitch();
        int atBats = request.plateAppearances() - request.walksAndHitByPitch();
        if (atBats < 0) {
            throw new InvalidGameCreateException("walksAndHitByPitch", "사사구는 타석보다 클 수 없습니다.");
        }

        batterRecordRepository.save(
                BatterRecord.builder()
                        .gameId(game.id())
                        .userId(currentUserId)
                        .plateAppearances(request.plateAppearances())
                        .atBats(atBats)
                        .singles(request.singles())
                        .doubles(request.doubles())
                        .triples(request.triples())
                        .homeRuns(request.homeRuns())
                        .walks(walks)
                        .strikeOuts(0)
                        .hitByPitch(0)
                        .runsBattedIn(0)
                        .runs(0)
                        .stolenBases(0)
                        .caughtStealing(0)
                        .sacrificeHits(0)
                            .build()
        );
    }

    @Transactional
    public void updateRecord(long gameId, long batterRecordId, MatchRecordCreateRequest request) {
        long currentUserId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException(gameId));
        BatterRecord batterRecord = batterRecordRepository.findById(batterRecordId)
                .orElseThrow(() -> new BatterRecordNotFoundException(batterRecordId));

        if (!batterRecord.gameId().equals(game.id()) || currentUserId != safeLong(batterRecord.userId())) {
            throw new BatterRecordNotFoundException(batterRecordId);
        }

        int walks = request.walksAndHitByPitch();
        int atBats = request.plateAppearances() - request.walksAndHitByPitch();
        if (atBats < 0) {
            throw new InvalidGameCreateException("walksAndHitByPitch", "사사구는 타석보다 클 수 없습니다.");
        }

        batterRecord.update(
                request.plateAppearances(),
                atBats,
                request.singles(),
                request.doubles(),
                request.triples(),
                request.homeRuns(),
                walks,
                0,
                0,
                0,
                0,
                0,
                0,
                0
        );

        batterRecordVerificationRepository.deleteByBatterRecordId(batterRecordId);
    }

    @Transactional
    public void deleteRecord(long gameId, long batterRecordId) {
        long currentUserId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException(gameId));
        BatterRecord batterRecord = batterRecordRepository.findById(batterRecordId)
                .orElseThrow(() -> new BatterRecordNotFoundException(batterRecordId));

        if (!batterRecord.gameId().equals(game.id()) || currentUserId != safeLong(batterRecord.userId())) {
            throw new BatterRecordNotFoundException(batterRecordId);
        }

        batterRecordVerificationRepository.deleteByBatterRecordId(batterRecordId);
        batterRecordRepository.delete(batterRecord);
    }

    @Transactional
    public void verifyRecord(long gameId, long batterRecordId) {
        long currentUserId = currentUserProvider.getCurrentUserId();
        GameRecord game = gameRecordRepository.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException(gameId));
        BatterRecord target = batterRecordRepository.findById(batterRecordId)
                .orElseThrow(() -> new BatterRecordNotFoundException(batterRecordId));
        if (!target.gameId().equals(game.id())) {
            throw new BatterRecordNotFoundException(batterRecordId);
        }
        if (currentUserId == safeLong(target.userId())) {
            throw new MatchVerificationNotAllowedException();
        }

        boolean currentUserIsCreator = currentUserId == safeLong(game.createdByUserId());
        boolean currentUserHasRecord = batterRecordRepository.findByGameIdAndUserId(gameId, currentUserId).isPresent();
        if (!currentUserIsCreator && !currentUserHasRecord) {
            throw new MatchVerificationNotAllowedException();
        }
        if (batterRecordVerificationRepository.existsByBatterRecordIdAndVerifiedByUserId(batterRecordId, currentUserId)) {
            throw new DuplicateMatchVerificationException(batterRecordId);
        }

        batterRecordVerificationRepository.save(
                BatterRecordVerification.builder()
                        .batterRecordId(batterRecordId)
                        .verifiedByUserId(currentUserId)
                        .build()
        );
    }

    private void validateStadiumName(String stadiumName) {
        if (stadiumName == null || stadiumName.isBlank()) {
            throw new InvalidGameCreateException("stadiumName", "구장명을 입력해주세요.");
        }
    }

    private long safeLong(Long value) {
        return value == null ? -1L : value;
    }
}
