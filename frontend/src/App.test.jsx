import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function renderAt(pathname) {
  window.history.pushState({}, "", pathname);
  return render(<App />);
}

test("앱이 라우터와 함께 렌더된다", () => {
  renderAt("/");

  expect(screen.getByRole("heading", { name: "로그인" })).toBeInTheDocument();
  expect(screen.getByText("My Baseball Record")).toBeInTheDocument();
});

test("기록 화면 레이아웃을 렌더한다", () => {
  renderAt("/records");

  expect(
    screen.getByRole("heading", { name: "시즌 기록" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "경기 추가" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "타자" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.queryByText("타석 / 이닝")).not.toBeInTheDocument();
  expect(screen.getByText("타석")).toBeInTheDocument();
  expect(screen.getByText("기록 범위")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "연도 선택" })).toBeInTheDocument();
});

test("경기 입력 화면 레이아웃을 렌더한다", () => {
  renderAt("/games/new");

  expect(
    screen.getByRole("heading", { name: "경기 기록 입력" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "타자 기록" })).toBeInTheDocument();
  expect(screen.queryByText("투수 기록", { selector: "h3" })).not.toBeInTheDocument();
  expect(screen.getByText("현재는 타자 기록 탭이 선택된 상태입니다.")).toBeInTheDocument();
});

test("연도 선택과 경기 필터를 바꾸면 기록 화면 상태가 바뀐다", async () => {
  const user = userEvent.setup();
  renderAt("/records");

  await user.click(screen.getByRole("button", { name: "연도 선택" }));
  await user.click(screen.getByRole("button", { name: "2025 시즌" }));
  await user.click(screen.getByRole("button", { name: "비공식 경기" }));

  expect(screen.getByText("2025 시즌 기록을 보는 중입니다.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "비공식 경기" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("추가 기록 입력을 누르면 확장 필드가 보인다", async () => {
  const user = userEvent.setup();
  renderAt("/games/new");

  expect(screen.queryByLabelText("타점")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "추가 기록 입력" }));

  expect(screen.getByLabelText("타점")).toBeInTheDocument();
  expect(screen.getByLabelText("득점")).toBeInTheDocument();
});
