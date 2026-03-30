"use client";

import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { beginKakaoLogin } from "@/features/auth/api/auth-api";
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
  const { isAuthenticated, isBootstrapping, authError, clearAuthError } = useAuthSession();
  const [localError, setLocalError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace(getNextPath());
    }
  }, [isAuthenticated, isBootstrapping, router]);

  const handleKakaoLogin = useCallback(async () => {
    setIsSigningIn(true);
    setLocalError(null);
    clearAuthError();

    try {
      beginKakaoLogin();
    } catch (error) {
      setLocalError(error?.message || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setIsSigningIn(false);
    }
  }, [clearAuthError]);

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

        <div className={`google-button-shell kakao-button-shell${isSigningIn ? " is-disabled" : ""}`} aria-busy={isSigningIn ? "true" : "false"}>
          <button
            type="button"
            className="google-button kakao-button-visual"
            onClick={handleKakaoLogin}
            disabled={isSigningIn}
          >
            <span>{isSigningIn ? "로그인 처리 중..." : "카카오로 시작하기"}</span>
          </button>
        </div>
      </section>
    </main>
  );
}
