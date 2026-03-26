"use client";

import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isMockAuthMode } from "@/features/auth/api/auth-api";
import { mountKakaoLoginButton } from "@/features/auth/kakao/kakao-auth";
import { useAuthSession } from "@/features/auth/session/useAuthSession";

function getNextPath() {
  if (typeof window === "undefined") {
    return "/home";
  }

  const forcedRedirect = window.sessionStorage.getItem("auth.redirectAfterLogin");
  if (forcedRedirect && forcedRedirect.startsWith("/")) {
    window.sessionStorage.removeItem("auth.redirectAfterLogin");
    return forcedRedirect;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("from") === "logout") {
    return "/home";
  }

  const next = params.get("next");
  if (!next || !next.startsWith("/")) {
    return "/home";
  }

  return next;
}

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping, authError, clearAuthError, loginWithProviderToken } = useAuthSession();
  const [localError, setLocalError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const isMockMode = isMockAuthMode();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace(getNextPath());
    }
  }, [isAuthenticated, isBootstrapping, router]);

  const handleCredential = useCallback(async (idToken) => {
    setIsSigningIn(true);
    setLocalError(null);
    clearAuthError();

    try {
      await loginWithProviderToken(idToken);
      router.replace(getNextPath());
    } catch (error) {
      setLocalError(error?.message || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSigningIn(false);
    }
  }, [clearAuthError, loginWithProviderToken, router]);

  useEffect(() => {
    if (isMockMode) {
      setIsKakaoReady(true);
      return;
    }

    const buttonHost = document.getElementById("kakao-signin-button");
    if (!buttonHost) {
      return;
    }

    setIsKakaoReady(false);
    let cleanup = () => {};

    mountKakaoLoginButton({
      element: buttonHost,
      onCredential: handleCredential,
      onSuccess: handleCredential,
      onError: (message) => setLocalError(message),
    }).then((result) => {
      if (!result.ok) {
        setLocalError(result.message);
        setIsKakaoReady(false);
        return;
      }
      cleanup = result.cleanup ?? (() => {});
      setIsKakaoReady(true);
    });

    return () => {
      cleanup();
    };
  }, [handleCredential, isMockMode]);

  return (
    <main className="page-shell auth-page">
      <section className="panel auth-panel">
        <div className="auth-hero">
          <p className="auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">
              ⚾
            </span>
            <span>MY BASEBALL RECORD</span>
          </p>
          <h1 className="page-title auth-title">
            경기 후 기록,
            <br />
            한 번에 남기고 바로 확인하세요
          </h1>
          <p className="section-copy auth-copy">
            공식 기록이 없는 경기까지
            한곳에 쌓아 시즌과 통산 기록으로 확인합니다.
          </p>
        </div>

        {authError || localError ? (
          <section className="form-error-banner auth-error-banner" role="alert" aria-live="polite">
            <strong>로그인 안내</strong>
            <p className="auth-error-copy">{localError || authError}</p>
          </section>
        ) : null}

        <div
          className={`google-button-shell kakao-button-shell${isSigningIn || !isKakaoReady ? " is-disabled" : ""}`}
          aria-busy={isSigningIn ? "true" : "false"}
        >
          {isMockMode ? (
            <button
              type="button"
              className="google-button kakao-button-visual"
              onClick={() => handleCredential("mock-kakao-token")}
              disabled={isSigningIn}
            >
              <span>{isSigningIn ? "로그인 처리 중..." : "카카오로 시작하기"}</span>
            </button>
          ) : (
            <div className="google-button google-button-visual kakao-button-visual" aria-hidden="true">
              <span>{isSigningIn ? "로그인 처리 중..." : "카카오로 시작하기"}</span>
            </div>
          )}

          {isMockMode ? null : (
            <div
              id="kakao-signin-button"
              className={`google-signin-overlay-host${isSigningIn || !isKakaoReady ? " is-disabled" : ""}`}
            />
          )}
        </div>
      </section>
    </main>
  );
}
