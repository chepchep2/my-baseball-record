package com.chepchep2.mybaseballrecord.exception;

import com.chepchep2.mybaseballrecord.exception.auth.GoogleAuthFailedException;
import com.chepchep2.mybaseballrecord.exception.auth.InvalidGoogleTokenException;
import com.chepchep2.mybaseballrecord.exception.auth.AccessTokenRequiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenExpiredException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenInvalidException;
import com.chepchep2.mybaseballrecord.exception.auth.RefreshTokenRevokedException;
import com.chepchep2.mybaseballrecord.exception.game.GameImmutableFieldException;
import com.chepchep2.mybaseballrecord.exception.game.GameNotFoundException;
import com.chepchep2.mybaseballrecord.exception.stats.InvalidStatsQueryException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        List<ApiErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .toList();

        return ResponseEntity.badRequest().body(
                new ApiErrorResponse(
                        "VALIDATION_ERROR",
                        "입력값을 확인해주세요.",
                        fieldErrors,
                        false
                )
        );
    }

    @ExceptionHandler(InvalidGoogleTokenException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidGoogleToken(InvalidGoogleTokenException ex) {
        return ResponseEntity.badRequest().body(
                new ApiErrorResponse(
                        "INVALID_GOOGLE_TOKEN",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(GoogleAuthFailedException.class)
    public ResponseEntity<ApiErrorResponse> handleGoogleAuthFailed(GoogleAuthFailedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiErrorResponse(
                        "GOOGLE_AUTH_FAILED",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(AccessTokenRequiredException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessTokenRequired(AccessTokenRequiredException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiErrorResponse(
                        "ACCESS_TOKEN_REQUIRED",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(RefreshTokenInvalidException.class)
    public ResponseEntity<ApiErrorResponse> handleRefreshTokenInvalid(RefreshTokenInvalidException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiErrorResponse(
                        "REFRESH_TOKEN_INVALID",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(RefreshTokenExpiredException.class)
    public ResponseEntity<ApiErrorResponse> handleRefreshTokenExpired(RefreshTokenExpiredException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiErrorResponse(
                        "REFRESH_TOKEN_EXPIRED",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(RefreshTokenRevokedException.class)
    public ResponseEntity<ApiErrorResponse> handleRefreshTokenRevoked(RefreshTokenRevokedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiErrorResponse(
                        "REFRESH_TOKEN_REVOKED",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(GameNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleGameNotFound(GameNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiErrorResponse(
                        "GAME_NOT_FOUND",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(GameImmutableFieldException.class)
    public ResponseEntity<ApiErrorResponse> handleGameImmutableField(GameImmutableFieldException ex) {
        return ResponseEntity.badRequest().body(
                new ApiErrorResponse(
                        "GAME_IMMUTABLE_FIELD",
                        ex.getMessage(),
                        List.of(),
                        false
                )
        );
    }

    @ExceptionHandler(InvalidStatsQueryException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidStatsQuery(InvalidStatsQueryException ex) {
        return ResponseEntity.badRequest().body(
                new ApiErrorResponse(
                        "VALIDATION_ERROR",
                        "입력값을 확인해주세요.",
                        List.of(new ApiErrorResponse.FieldError(ex.field(), ex.getMessage())),
                        false
                )
        );
    }

    private ApiErrorResponse.FieldError toFieldError(FieldError fieldError) {
        return new ApiErrorResponse.FieldError(
                fieldError.getField(),
                fieldError.getDefaultMessage() == null ? "유효하지 않은 입력입니다." : fieldError.getDefaultMessage()
        );
    }
}
