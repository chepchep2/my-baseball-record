import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameRecordEditPageClient from "../GameRecordEditPageClient";
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

describe("GameRecordEditPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("상세 조회값을 기록값 수정 화면에 채운다", async () => {
    getGameDetail.mockResolvedValue({
      id: 101,
      playedAt: "2026-03-18",
      seasonYear: 2026,
      gameType: "LEAGUE",
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
      plateAppearances: 4,
      walksAndHitByPitch: 1,
      singles: 1,
      doubles: 1,
      triples: 0,
      homeRuns: 0,
    });

    render(<GameRecordEditPageClient gameId="101" />);

    expect(await screen.findByRole("heading", { name: "경기 기록 수정" })).toBeInTheDocument();
    expect(screen.getByLabelText("타석")).toHaveValue("4");
    expect(screen.getByLabelText("사사구")).toHaveValue("1");
    expect(screen.getByLabelText("2루타")).toHaveValue("1");
    expect(screen.queryByRole("button", { name: "취소" })).not.toBeInTheDocument();
  });

  it("기록값만 수정 저장하고 기존 메타데이터는 보존한다", async () => {
    getGameDetail.mockResolvedValue({
      id: 101,
      playedAt: "2026-03-18",
      seasonYear: 2026,
      gameType: "LEAGUE",
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
      plateAppearances: 4,
      walksAndHitByPitch: 1,
      singles: 1,
      doubles: 1,
      triples: 0,
      homeRuns: 0,
    });
    updateGame.mockResolvedValue({ id: 101 });

    render(<GameRecordEditPageClient gameId="101" />);

    await screen.findByLabelText("타석");
    await userEvent.click(screen.getByRole("button", { name: "홈런 0" }));
    await userEvent.keyboard("{Control>}a{/Control}{Backspace}");
    await userEvent.type(screen.getByLabelText("홈런"), "1");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(updateGame).toHaveBeenCalledTimes(1));
    expect(updateGame).toHaveBeenCalledWith(expect.any(Object), "101", {
      gameInfo: {
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
        homeRuns: 1,
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
    expect(pushMock).toHaveBeenCalledWith("/games/101");
  });
});
