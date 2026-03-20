package com.chepchep2.mybaseballrecord.infrastructure.auth;

import com.chepchep2.mybaseballrecord.exception.auth.AccessTokenRequiredException;
import com.chepchep2.mybaseballrecord.service.auth.CurrentUserProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityContextCurrentUserProvider implements CurrentUserProvider {

    @Override
    public long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessTokenRequiredException("access token is required.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        if (principal instanceof String principalText) {
            try {
                return Long.parseLong(principalText);
            } catch (NumberFormatException ignored) {
                throw new AccessTokenRequiredException("access token subject is invalid.");
            }
        }
        throw new AccessTokenRequiredException("access token subject is invalid.");
    }
}
