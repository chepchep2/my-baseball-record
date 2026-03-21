"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mountGoogleSignInButton } from "@/features/auth/google/google-identity";
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
  const { isAuthenticated, isBootstrapping, authError, clearAuthError, loginWithGoogleIdToken } = useAuthSession();
  const [localError, setLocalError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

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
      await loginWithGoogleIdToken(idToken);
      router.replace(getNextPath());
    } catch (error) {
      setLocalError(error?.message || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSigningIn(false);
    }
  }, [clearAuthError, loginWithGoogleIdToken, router]);

  useEffect(() => {
    const buttonHost = document.getElementById("google-signin-button");
    if (!buttonHost) {
      return;
    }

    setIsGoogleReady(false);
    mountGoogleSignInButton({
      element: buttonHost,
      onCredential: handleCredential,
      onError: (message) => setLocalError(message),
    }).then((result) => {
      if (!result.ok) {
        setLocalError(result.message);
        setIsGoogleReady(false);
        return;
      }
      setIsGoogleReady(true);
    });
  }, [handleCredential]);

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
            내 야구 기록을
            <br />
            한눈에 확인하세요
          </h1>
          <p className="section-copy auth-copy">
            리그 경기, 연습경기, 용병 경기 기록까지
            {/* <br /> */}
            한곳에 모아 확인하세요.
          </p>
        </div>

        {authError || localError ? (
          <section className="form-error-banner auth-error-banner" role="alert" aria-live="polite">
            <strong>로그인 안내</strong>
            <p className="auth-error-copy">{localError || authError}</p>
          </section>
        ) : null}

        <div
          className={`google-button-shell${isSigningIn || !isGoogleReady ? " is-disabled" : ""}`}
          aria-busy={isSigningIn ? "true" : "false"}
        >
          <div className="google-button google-button-visual" aria-hidden="true">
            <span className="google-mark" aria-hidden="true">
              G
            </span>
            <span>{isSigningIn ? "로그인 처리 중..." : "Google로 계속하기"}</span>
          </div>

          <div
            id="google-signin-button"
            className={`google-signin-overlay-host${isSigningIn || !isGoogleReady ? " is-disabled" : ""}`}
            aria-hidden="true"
          />
        </div>
      </section>
    </main>
  );
}
