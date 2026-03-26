import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EntryFlowClient from "../EntryFlowClient";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/features/home/api/mock-home-store", () => ({
  saveMockGame: vi.fn(),
}));

describe("EntryFlowClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/games/new");
  });

  it("1/4부터 4/4까지 진행하고 저장 후 홈으로 이동한다", async () => {
    render(<EntryFlowClient />);

    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("2 / 4")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "4");
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "1");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    await userEvent.clear(screen.getByLabelText("1루타"));
    await userEvent.type(screen.getByLabelText("1루타"), "1");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    await userEvent.clear(screen.getByLabelText("홈런"));
    await userEvent.type(screen.getByLabelText("홈런"), "1");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
  });

  it("잘못된 값이면 오류 메시지를 보여주고 다음 버튼을 비활성화한다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "1");
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "2");

    expect(screen.getByText("사사구는 타석보다 클 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });
});
