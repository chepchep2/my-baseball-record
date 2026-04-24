import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameDateTimeEditPageClient from "../GameDateTimeEditPageClient";
import { getGameDetail, updateGame } from "@/features/games/api/games-api";

const pushMock = vi.fn();
const apiClientMock = { get: vi.fn(), put: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({
    apiClient: apiClientMock,
  }),
}));

vi.mock("@/features/games/api/games-api", () => ({
  getGameDetail: vi.fn(),
  updateGame: vi.fn(),
}));

describe("GameDateTimeEditPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("상세 조회값을 날짜와 시간 수정 화면에 채운다", async () => {
    getGameDetail.mockResolvedValue({
      id: 101,
      playedDate: "2026-04-05",
      playedHour: 11,
      playedMinute: 30,
      teamName: "블루스톰",
      opponentName: "레전드",
      memo: "기존 메모",
      participationType: "BATTER",
      batter: {
        plateAppearances: 4,
        atBats: 3,
        singles: 1,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        walks: 1,
        strikeOuts: 2,
        hitByPitch: 0,
        runsBattedIn: 3,
        runs: 1,
        stolenBases: 0,
        caughtStealing: 0,
        sacrificeHits: 0,
      },
      pitcher: null,
    });

    render(<GameDateTimeEditPageClient gameId="101" />);

    expect(await screen.findByRole("heading", { name: "경기 기록" })).toBeInTheDocument();
    expect(screen.getByLabelText("시 선택")).toHaveValue("11");
    expect(screen.getByLabelText("분 선택")).toHaveValue("30");
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("날짜와 시간을 수정 저장하고 기존 메타데이터와 기록값은 보존한다", async () => {
    getGameDetail.mockResolvedValue({
      id: 101,
      playedDate: "2026-04-05",
      playedHour: 11,
      playedMinute: 30,
      teamName: "블루스톰",
      opponentName: "레전드",
      memo: "기존 메모",
      participationType: "BATTER",
      batter: {
        plateAppearances: 4,
        atBats: 3,
        singles: 1,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        walks: 1,
        strikeOuts: 2,
        hitByPitch: 0,
        runsBattedIn: 3,
        runs: 1,
        stolenBases: 0,
        caughtStealing: 0,
        sacrificeHits: 0,
      },
      pitcher: null,
    });
    updateGame.mockResolvedValue({ id: 101 });

    render(<GameDateTimeEditPageClient gameId="101" />);

    await screen.findByLabelText("시 선택");
    await userEvent.selectOptions(screen.getByLabelText("시 선택"), "10");
    await userEvent.selectOptions(screen.getByLabelText("분 선택"), "00");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(updateGame).toHaveBeenCalledTimes(1));
    expect(updateGame).toHaveBeenCalledWith(expect.any(Object), "101", {
      gameInfo: {
        playedDate: "2026-04-05",
        playedHour: 10,
        playedMinute: 0,
        teamName: "블루스톰",
        opponentName: "레전드",
        memo: "기존 메모",
      },
      batter: {
        plateAppearances: 4,
        atBats: 3,
        singles: 1,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        walks: 1,
        strikeOuts: 2,
        hitByPitch: 0,
        runsBattedIn: 3,
        runs: 1,
        stolenBases: 0,
        caughtStealing: 0,
        sacrificeHits: 0,
      },
      pitcher: null,
    });
    expect(pushMock).toHaveBeenCalledWith("/home");
  });
});
