import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MatchRecordCreatePageClient from "../MatchRecordCreatePageClient";

const { pushMock, createMatchRecordMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  createMatchRecordMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({ apiClient: { post: vi.fn() } }),
}));

vi.mock("@/features/matches/api/matches-api", () => ({
  createMatchRecord: createMatchRecordMock,
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock("@/components/prototypes/PrototypeEntryStepCounts", () => ({
  default: ({ onSubmit }) => <button onClick={onSubmit}>저장</button>,
}));

describe("MatchRecordCreatePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMatchRecordMock.mockResolvedValue({ batterRecordId: 1 });
  });

  it("기록 저장이 성공하면 경기 정보가 아니라 홈으로 이동한다", async () => {
    render(<MatchRecordCreatePageClient gameId="47" />);

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
    expect(pushMock).not.toHaveBeenCalledWith("/matches/47");
  });
});
