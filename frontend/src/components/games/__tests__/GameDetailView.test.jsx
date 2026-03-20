import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameDetailView from "../GameDetailView";
import { deleteGame } from "@/features/games/api/games-api";

const pushMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/navigation/BottomTabBar", () => ({
  default: () => <div>tabs</div>,
}));

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

  it("API에서 변환된 상세 데이터를 렌더링한다", () => {
    render(
      <GameDetailView
        game={{
          id: 101,
          playedAt: "2026-03-18",
          seasonYear: 2026,
          gameType: "LEAGUE",
          participationType: "BOTH",
          teamName: "블루스톰",
          opponentName: "레전드",
          memo: "비 오는 날 경기",
          batter: {
            plateAppearances: 4,
            atBats: 3,
            singles: 1,
            doubles: 1,
            triples: 0,
            homeRuns: 1,
            walks: 1,
            strikeOuts: 0,
            hitByPitch: 0,
            runsBattedIn: 3,
            runs: 2,
            stolenBases: 0,
            caughtStealing: 0,
            sacrificeHits: 0,
          },
          pitcher: {
            innings: 1,
            additionalOuts: 0,
            runsAllowed: 0,
            earnedRuns: 0,
            hitsAllowed: 1,
            walks: 0,
            strikeOuts: 2,
            hitByPitch: 0,
            homeRunsAllowed: 0,
            battersFaced: 4,
            wins: 0,
            losses: 0,
            saves: 0,
            holds: 0,
          },
        }}
      />,
    );

    expect(screen.getByText("개별 경기 상세")).toBeInTheDocument();
    expect(screen.getByText("블루스톰")).toBeInTheDocument();
    expect(screen.getByText("레전드")).toBeInTheDocument();
    expect(screen.getByText("비 오는 날 경기")).toBeInTheDocument();
    expect(screen.getByText("타석")).toBeInTheDocument();
  });

  it("삭제 확인 후 DELETE 호출하고 경기 목록으로 이동한다", async () => {
    deleteGame.mockResolvedValue(null);

    render(
      <GameDetailView
        game={{
          id: 101,
          playedAt: "2026-03-18",
          seasonYear: 2026,
          gameType: "LEAGUE",
          participationType: "BATTER",
          teamName: "블루스톰",
          opponentName: "레전드",
          memo: "비 오는 날 경기",
          batter: {
            plateAppearances: 4,
            atBats: 3,
            singles: 1,
            doubles: 1,
            triples: 0,
            homeRuns: 1,
            walks: 1,
            strikeOuts: 0,
            hitByPitch: 0,
            runsBattedIn: 3,
            runs: 2,
            stolenBases: 0,
            caughtStealing: 0,
            sacrificeHits: 0,
          },
          pitcher: null,
        }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "더보기" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "삭제" }));
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(deleteGame).toHaveBeenCalledTimes(1));
    expect(pushMock).toHaveBeenCalledWith("/games");
  });
});
