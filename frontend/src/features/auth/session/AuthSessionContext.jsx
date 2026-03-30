/* eslint-disable react-refresh/only-export-components */
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createApiClient } from "@/lib/http/api-client";
import {
  beginKakaoLogin as beginKakaoLoginApi,
  getAuthSession,
  isMockAuthMode,
  logoutSession,
  refreshSession as refreshSessionApi,
} from "@/features/auth/api/auth-api";
import { clearSessionTokens, getAccessToken, readSessionMeta, saveSessionTokens } from "@/features/auth/session/token-storage";

const AuthSessionContext = createContext(null);

function getAuthMessage(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "GOOGLE_AUTH_FAILED") {
    return "Google 인증에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.code === "INVALID_KAKAO_TOKEN") {
    return "카카오 로그인 정보가 올바르지 않습니다.";
  }

  if (
    error.code === "REFRESH_TOKEN_INVALID" ||
    error.code === "REFRESH_TOKEN_EXPIRED" ||
    error.code === "REFRESH_TOKEN_REVOKED"
  ) {
    return "세션이 만료되었습니다. 다시 로그인해 주세요.";
  }

  return error.message || fallbackMessage;
}

export function AuthSessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const refreshPromiseRef = useRef(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const clearSessionState = useCallback(() => {
    clearSessionTokens();
    setUser(null);
  }, []);

  const refreshIfNeeded = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshPromise = refreshSessionApi()
      .then((session) => {
        saveSessionTokens(session);
        setUser((previousUser) => session.user ?? previousUser ?? null);
        setAuthError(null);
        return session;
      })
      .catch((error) => {
        clearSessionState();
        setAuthError(getAuthMessage(error, "세션이 만료되었습니다. 다시 로그인해 주세요."));
        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, [clearSessionState]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const sessionMeta = readSessionMeta();
      if (sessionMeta?.user) {
        setUser(sessionMeta.user);
      }

      if (isMockAuthMode()) {
        if (active) {
          setAuthError(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const session = await getAuthSession();
        saveSessionTokens(session);
        if (active) {
          setUser(session.user ?? null);
          setAuthError(null);
        }
      } catch {
        if (active) {
          clearSessionState();
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [clearSessionState, refreshIfNeeded]);

  const beginKakaoLogin = useCallback(async () => {
    setIsBootstrapping(false);
    setAuthError(null);
    beginKakaoLoginApi();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      clearSessionState();
      setAuthError(null);
    }
  }, [clearSessionState]);

  const apiClient = useMemo(
    () =>
      createApiClient({
        getAccessToken,
        refreshSession: refreshIfNeeded,
        onRefreshSuccess: saveSessionTokens,
        onRefreshFailed: (error) => {
          clearSessionState();
          setAuthError(getAuthMessage(error, "세션이 만료되었습니다. 다시 로그인해 주세요."));
        },
      }),
    [clearSessionState, refreshIfNeeded],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      authError,
      apiClient,
      clearAuthError,
      beginKakaoLogin,
      refreshIfNeeded,
      logout,
    }),
    [
      user,
      isBootstrapping,
      authError,
      apiClient,
      clearAuthError,
      beginKakaoLogin,
      refreshIfNeeded,
      logout,
    ],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider.");
  }

  return context;
}
