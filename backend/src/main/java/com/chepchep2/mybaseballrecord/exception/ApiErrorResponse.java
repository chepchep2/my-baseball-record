package com.chepchep2.mybaseballrecord.exception;

import java.util.List;

public record ApiErrorResponse(
        String code,
        String message,
        List<FieldError> fieldErrors,
        boolean retryable
) {
    public record FieldError(
            String field,
            String message
    ) {
    }
}
