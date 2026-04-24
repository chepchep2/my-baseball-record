import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameDetailView from "../GameDetailView";
import { deleteGame } from "@/features/games/api/games-api";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({
    apiClient: { delete: vi.fn() },
  }),
}));

vi.mock("@/features/games/api/games-api", () => ({
  deleteGame: vi.fn(),
}));

describe("GameDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flat 상세 데이터를 읽기 전용 기록 상세 화면으로 렌더링한다", () => {
    render(
      <GameDetailView
        game={{
          id: 101,
          playedDate: "2026-04-05",
          playedHour: 11,
          playedMinute: 30,
          playedAtLabel: "4/5 11:30",
          plateAppearances: 4,
          walksAndHitByPitch: 1,
          singles: 1,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          atBats: 3,
          hits: 1,
          battingAverage: 0.333,
          onBasePercentage: 0.5,
          sluggingPercentage: 0.333,
          ops: 0.833,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "경기 기록" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "수정" })).toHaveAttribute("href", "/games/101/edit");
    expect(screen.getByRole("link", { name: "날짜와 시간 수정" })).toHaveAttribute("href", "/games/101/date-time");
    expect(screen.getByText("2026년 4월 5일")).toBeInTheDocument();
    expect(screen.getByText("11:30")).toBeInTheDocument();
    expect(screen.getByText("타석")).toBeInTheDocument();
    expect(screen.getByText("사사구")).toBeInTheDocument();
    expect(screen.getByText("1루타")).toBeInTheDocument();
    expect(screen.getByText("타율 .333")).toBeInTheDocument();
    expect(screen.getByText("출루율 .500")).toBeInTheDocument();
    expect(screen.getByText("장타율 .333")).toBeInTheDocument();
    expect(screen.getByText("OPS .833")).toBeInTheDocument();
    expect(screen.getByText("타율 .333").compareDocumentPosition(screen.getByText("타석"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("삭제 확인 후 DELETE를 호출하고 전체 경기 목록으로 이동한다", async () => {
    deleteGame.mockResolvedValue(null);

    render(
      <GameDetailView
        game={{
          id: 101,
          playedDate: "2026-04-05",
          playedHour: 11,
          playedMinute: 30,
          plateAppearances: 4,
          walksAndHitByPitch: 1,
          singles: 1,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          battingAverage: 0.333,
          onBasePercentage: 0.5,
          sluggingPercentage: 0.333,
          ops: 0.833,
        }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => expect(deleteGame).toHaveBeenCalledTimes(1));
    expect(pushMock).toHaveBeenCalledWith("/games");
  });
});
