import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameForm from "../GameForm";
import { createGame, getGameDetail, updateGame } from "@/features/games/api/games-api";

const { pushMock, writeDraftMock, authSessionState } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  writeDraftMock: vi.fn(),
  authSessionState: {
    isBootstrapping: false,
    user: { id: 7, email: "user@gmail.com" },
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/navigation/BottomTabBar", () => ({
  default: () => <div>tabs</div>,
}));

vi.mock("@/components/layout/PageHeader", () => ({
  default: ({ title }) => <h1>{title}</h1>,
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({
    ...authSessionState,
    apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  }),
}));

vi.mock("@/features/games/api/games-api", () => ({
  getGameDetail: vi.fn(),
  createGame: vi.fn(),
  updateGame: vi.fn(),
  deleteGame: vi.fn(),
}));

vi.mock("@/lib/game-draft", () => ({
  clearDraft: vi.fn(),
  readDraft: vi.fn().mockReturnValue(null),
  shouldAutoRestoreDraft: vi.fn().mockReturnValue(false),
  writeDraft: writeDraftMock,
}));

describe("GameForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authSessionState.isBootstrapping = false;
    authSessionState.user = { id: 7, email: "user@gmail.com" };
  });

  it("초안 저장 키에 현재 로그인 사용자 id를 사용한다", async () => {
    render(<GameForm mode="create" />);

    await waitFor(() => expect(writeDraftMock).toHaveBeenCalled());
    expect(writeDraftMock.mock.calls[0][0]).toBe("draft:create:7");
  });

  it("세션 부트스트랩 중에는 익명 초안을 읽거나 쓰지 않는다", async () => {
    authSessionState.isBootstrapping = true;
    authSessionState.user = null;

    render(<GameForm mode="create" />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(writeDraftMock).not.toHaveBeenCalled();
  });

  it("생성 저장 성공 시 POST 호출 후 상세 화면으로 이동한다", async () => {
    createGame.mockResolvedValue({ id: 301 });

    render(<GameForm mode="create" />);

    await userEvent.click(await screen.findByRole("button", { name: "다음" }));
    await userEvent.type(screen.getByLabelText("타석"), "4");
    await userEvent.type(screen.getByLabelText("타수"), "3");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(createGame).toHaveBeenCalledTimes(1));
    expect(pushMock).toHaveBeenCalledWith("/games/301");
  });

  it("생성 모드에서 타자/투수 기록이 모두 없으면 저장하지 않고 안내 문구를 보여준다", async () => {
    render(<GameForm mode="create" />);

    await userEvent.click(await screen.findByRole("button", { name: "다음" }));
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(createGame).not.toHaveBeenCalled();
    expect(screen.getByText("타자 기록 또는 투수 기록 중 하나는 입력해야 합니다.")).toBeInTheDocument();
  });

  it("수정 모드면 상세 API를 불러와 폼을 채운다", async () => {
    getGameDetail.mockResolvedValue({
      id: 101,
      playedAt: "2026-03-18",
      seasonYear: 2026,
      gameType: "LEAGUE",
      participationType: "BATTER",
      teamName: "블루스톰",
      opponentName: "레전드",
      memo: "기존 메모",
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
    });
    updateGame.mockResolvedValue({ id: 101 });

    render(<GameForm mode="edit" gameId="101" />);

    expect(await screen.findByDisplayValue("블루스톰")).toBeInTheDocument();
    expect(screen.getByDisplayValue("레전드")).toBeInTheDocument();
  });
});
