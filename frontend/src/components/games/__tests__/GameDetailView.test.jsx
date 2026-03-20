import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GameDetailView from "../GameDetailView";

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

describe("GameDetailView", () => {
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
});
