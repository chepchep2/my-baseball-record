"use client";

import Link from "next/link";

export default function AuthPage() {
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

        <Link className="google-button" href="/records">
          <span className="google-mark" aria-hidden="true">
            G
          </span>
          <span>Google로 계속하기</span>
        </Link>
      </section>
    </main>
  );
}
