import React, { useState } from "react";
import { Link } from "react-router-dom";

function AuthPage() {
  const [tab, setTab] = useState("login");

  return (
    <main className="page-shell auth-page">
      <section className="panel auth-panel">
        <div className="brand-row">
          <p className="eyebrow">My Baseball Record</p>
        </div>

        {tab === "login" ? (
          <section className="form-section" aria-label="로그인 화면">
            <h1>로그인</h1>
            <p className="section-copy">
              시즌 기록을 확인하려면 먼저 로그인하세요.
            </p>
            <div className="banner-placeholder">상단 에러 배너 영역</div>
            <label className="field">
              <span>이메일</span>
              <input type="email" placeholder="user@example.com" />
            </label>
            <label className="field">
              <span>비밀번호</span>
              <input type="password" placeholder="********" />
            </label>
            <button type="button" className="primary-button">
              로그인
            </button>
            <button
              type="button"
              className="inline-link"
              onClick={() => setTab("signup")}
            >
              처음인가요? 회원가입으로 이동
            </button>
          </section>
        ) : (
          <section className="form-section" aria-label="회원가입 화면">
            <h1>회원가입</h1>
            <p className="section-copy">
              계정을 만들고 시즌 기록을 한곳에서 관리하세요.
            </p>
            <div className="banner-placeholder">상단 에러 배너 영역</div>
            <label className="field">
              <span>이름</span>
              <input type="text" placeholder="홍길동" />
            </label>
            <label className="field">
              <span>이메일</span>
              <input type="email" placeholder="user@example.com" />
            </label>
            <label className="field">
              <span>비밀번호</span>
              <input type="password" placeholder="Passw0rd!" />
            </label>
            <label className="field">
              <span>비밀번호 확인</span>
              <input type="password" placeholder="Passw0rd!" />
            </label>
            <button type="button" className="primary-button">
              회원가입
            </button>
            <button
              type="button"
              className="inline-link"
              onClick={() => setTab("login")}
            >
              이미 계정이 있나요? 로그인으로 이동
            </button>
          </section>
        )}

        <div className="route-hint">
          정적 UI 확인용 단계입니다. 기록 화면은 <Link to="/records">여기</Link>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
