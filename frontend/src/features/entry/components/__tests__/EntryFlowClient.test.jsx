import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
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

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "4");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "1");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("1루타"));
    await userEvent.type(screen.getByLabelText("1루타"), "1");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
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
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "2");

    expect(screen.getByText("사사구는 타석보다 클 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  it("홈런 입력에서도 앞의 0이 붙지 않는다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "4");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "0");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));

    const homeRunInput = screen.getByLabelText("홈런");
    await userEvent.clear(homeRunInput);
    await userEvent.type(homeRunInput, "1");

    expect(homeRunInput).toHaveValue("1");
  });

  it("안타 합이 타수를 넘으면 에러 문구를 통일한다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "3");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("1루타"));
    await userEvent.type(screen.getByLabelText("1루타"), "4");

    expect(screen.getByText("안타의 합은 타수보다 클 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  it("원하는 필드를 누르면 그 입력칸으로 다시 이동할 수 있다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "4");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "1");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));

    await userEvent.click(screen.getByRole("button", { name: /^타석/ }));

    expect(screen.getByLabelText("타석")).toHaveFocus();
  });

  it("타수 0이면 안타 입력 없이 바로 저장할 수 있다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "5");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "5");

    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    expect(screen.getByLabelText("1루타")).toBeDisabled();
    expect(screen.getByLabelText("홈런")).toBeDisabled();
  });

  it("남은 타수 1에서 1루타를 입력하면 바로 저장으로 전환된다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "5");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "4");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("1루타"));
    await userEvent.type(screen.getByLabelText("1루타"), "1");

    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    expect(screen.getByLabelText("2루타")).toBeDisabled();
    expect(screen.getByLabelText("홈런")).toBeDisabled();
  });

  it("남은 타수 1에서 2루타를 입력해도 바로 저장으로 전환된다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "5");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "4");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("2루타"));
    await userEvent.type(screen.getByLabelText("2루타"), "1");

    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    expect(screen.getByLabelText("3루타")).toBeDisabled();
    expect(screen.getByLabelText("홈런")).toBeDisabled();
  });

  it("오늘 날짜에서는 현재 시간 이후 hour option을 노출하지 않는다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-26T18:12:00"));

    render(<EntryFlowClient />);

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    const hourSelect = screen.getByLabelText("시 선택");
    const minuteSelect = screen.getByLabelText("분 선택");
    expect(screen.getByRole("option", { name: "18" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "19" })).not.toBeInTheDocument();
    expect(hourSelect).toHaveValue("18");
    expect(Array.from(minuteSelect.options).map((option) => option.value)).toEqual(["00", "10"]);
    expect(minuteSelect).toHaveValue("10");

    vi.useRealTimers();
  });

  it("활성 입력칸에는 enterKeyHint를 적용한다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "4");

    expect(screen.getByLabelText("타석")).toHaveAttribute("enterkeyhint", "next");

    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));

    expect(screen.getByLabelText("홈런")).toHaveAttribute("enterkeyhint", "done");
  });

  it("키보드가 열리면 하단 버튼을 키보드 위로 띄운다", async () => {
    const listeners = {};
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 900,
        offsetTop: 0,
        addEventListener: vi.fn((type, handler) => {
          listeners[type] = handler;
        }),
        removeEventListener: vi.fn(),
      },
    });

    render(<EntryFlowClient />);
    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    window.visualViewport.height = 560;
    await act(async () => {
      listeners.resize?.();
    });

    await waitFor(() => expect(screen.getByRole("button", { name: "다음 항목" })).toHaveClass("is-keyboard-floating"));
  });

  it("아래쪽 필드에서 viewport가 밀려도 하단 버튼을 키보드 위로 유지한다", async () => {
    const listeners = {};
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 900,
        offsetTop: 0,
        addEventListener: vi.fn((type, handler) => {
          listeners[type] = handler;
        }),
        removeEventListener: vi.fn(),
      },
    });

    render(<EntryFlowClient />);
    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    await userEvent.clear(screen.getByLabelText("타석"));
    await userEvent.type(screen.getByLabelText("타석"), "4");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.clear(screen.getByLabelText("사사구"));
    await userEvent.type(screen.getByLabelText("사사구"), "0");
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 항목" }));

    window.visualViewport.height = 560;
    window.visualViewport.offsetTop = 180;
    await act(async () => {
      listeners.resize?.();
      listeners.scroll?.();
    });

    const expectedBottom = `${window.innerHeight - window.visualViewport.height + 12}px`;
    const button = screen.getByRole("button", { name: "저장" });
    await waitFor(() => expect(button).toHaveClass("is-keyboard-floating"));
    expect(button).toHaveStyle({ bottom: expectedBottom });
  });

  it("1단계에서 뒤로가기를 하면 이탈 확인 모달을 보여준다", async () => {
    render(<EntryFlowClient />);

    await userEvent.selectOptions(screen.getByLabelText("시 선택"), "10");

    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByRole("dialog", { name: "기록 입력 중단 확인" })).toBeInTheDocument();
    expect(screen.getByText("기록 입력을 중단할까요?")).toBeInTheDocument();
  });
});
