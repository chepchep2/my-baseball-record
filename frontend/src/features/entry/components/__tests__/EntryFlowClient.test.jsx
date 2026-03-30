import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EntryFlowClient from "../EntryFlowClient";
import { createGame } from "@/features/games/api/games-api";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({
    apiClient: { post: vi.fn() },
  }),
}));

vi.mock("@/features/games/api/games-api", () => ({
  createGame: vi.fn().mockResolvedValue({ gameId: 1 }),
}));

async function setNumericValue(label, value) {
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value } });
}

async function activateField(label) {
  await userEvent.click(screen.getByRole("button", { name: new RegExp(`^${label}`) }));
  await waitFor(() => expect(screen.getByLabelText(label)).toHaveFocus());
}

describe("EntryFlowClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/games/new");
    createGame.mockResolvedValue({ gameId: 1 });
  });

  it("1/4부터 4/4까지 진행하고 저장 후 홈으로 이동한다", async () => {
    render(<EntryFlowClient />);

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    await setNumericValue("타석", "6");
    await activateField("사사구");
    await setNumericValue("사사구", "1");
    await activateField("1루타");
    await setNumericValue("1루타", "1");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("2루타")).toHaveFocus());
    await setNumericValue("2루타", "1");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("3루타")).toHaveFocus());
    await setNumericValue("3루타", "0");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("홈런")).toHaveFocus());
    const homeRunInput = screen.getByLabelText("홈런");
    fireEvent.change(homeRunInput, { target: { value: "1" } });
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
  });

  it("잘못된 값이면 오류 메시지를 보여주고 enter로도 다음 필드로 이동하지 않는다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "1");
    await activateField("사사구");
    fireEvent.change(screen.getByLabelText("사사구"), { target: { value: "2" } });

    expect(screen.getByText("사사구는 타석보다 클 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByLabelText("사사구")).toHaveFocus();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("홈런 입력에서도 앞의 0이 붙지 않는다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "4");
    await activateField("사사구");
    await setNumericValue("사사구", "0");
    await activateField("홈런");

    const homeRunInput = screen.getByLabelText("홈런");
    fireEvent.change(homeRunInput, { target: { value: "01" } });

    expect(homeRunInput).toHaveValue("1");
  });

  it("안타 합이 타수를 넘으면 에러 문구를 통일한다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "3");
    await activateField("1루타");
    fireEvent.change(screen.getByLabelText("1루타"), { target: { value: "4" } });

    expect(screen.getByText("안타의 합은 타수보다 클 수 없습니다.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("원하는 필드를 누르면 그 입력칸으로 다시 이동할 수 있다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "4");
    await activateField("사사구");
    await setNumericValue("사사구", "1");
    await activateField("1루타");

    await userEvent.click(screen.getByRole("button", { name: /^타석/ }));

    expect(screen.getByLabelText("타석")).toHaveFocus();
  });

  it("타수 0이면 안타 입력 없이 바로 저장할 수 있다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "5");
    await activateField("사사구");
    fireEvent.change(screen.getByLabelText("사사구"), { target: { value: "5" } });

    expect(screen.getByLabelText("1루타")).toBeDisabled();
    expect(screen.getByLabelText("홈런")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
  });

  it("남은 타수 1에서 1루타를 입력하면 바로 저장으로 전환된다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "5");
    await activateField("사사구");
    await setNumericValue("사사구", "4");
    await activateField("1루타");
    fireEvent.change(screen.getByLabelText("1루타"), { target: { value: "1" } });

    expect(screen.getByLabelText("2루타")).toBeDisabled();
    expect(screen.getByLabelText("홈런")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
  });

  it("남은 타수 1에서 2루타를 입력해도 바로 저장으로 전환된다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "5");
    await activateField("사사구");
    await setNumericValue("사사구", "4");
    await activateField("2루타");
    fireEvent.change(screen.getByLabelText("2루타"), { target: { value: "1" } });

    expect(screen.getByLabelText("3루타")).toBeDisabled();
    expect(screen.getByLabelText("홈런")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
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
    fireEvent.change(screen.getByLabelText("타석"), { target: { value: "4" } });

    expect(screen.getByLabelText("타석")).toHaveAttribute("enterkeyhint", "next");
    expect(screen.getByLabelText("타석")).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByLabelText("타석")).toHaveAttribute("pattern", "\\\\d*");
    expect(screen.getByLabelText("타석")).toHaveAttribute("autocomplete", "off");
    expect(screen.getByLabelText("타석")).toHaveAttribute("spellcheck", "false");

    await activateField("홈런");

    expect(screen.getByLabelText("홈런")).toHaveAttribute("enterkeyhint", "done");
  });

  it("2단계는 form submit으로도 다음 필드로 이동한다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "4");

    const entryForm = screen.getByLabelText("타석").closest("form");
    expect(entryForm).not.toBeNull();

    fireEvent.submit(entryForm);

    await waitFor(() => expect(screen.getByLabelText("사사구")).toHaveFocus());
  });

  it("2단계는 form keydown enter로도 다음 필드로 이동한다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "4");

    fireEvent.keyDown(screen.getByLabelText("타석"), { key: "Enter", keyCode: 13 });

    await waitFor(() => expect(screen.getByLabelText("사사구")).toHaveFocus());
  });

  it("마지막 필드에서는 form submit으로 저장된다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await setNumericValue("타석", "4");
    await activateField("사사구");
    await setNumericValue("사사구", "0");
    await activateField("1루타");
    await setNumericValue("1루타", "1");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("2루타")).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("3루타")).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("홈런")).toHaveFocus());
    fireEvent.change(screen.getByLabelText("홈런"), { target: { value: "1" } });

    const entryForm = screen.getByLabelText("홈런").closest("form");
    expect(entryForm).not.toBeNull();

    fireEvent.submit(entryForm);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
  });

  it("2단계에서는 다음 버튼을 노출하고 마지막 필드에서는 저장 버튼으로 바뀐다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();

    await setNumericValue("타석", "4");
    await activateField("사사구");
    await setNumericValue("사사구", "0");
    await activateField("1루타");
    await setNumericValue("1루타", "1");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("2루타")).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("3루타")).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(screen.getByLabelText("홈런")).toHaveFocus());

    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });


  it("각 입력값은 최대 10까지만 입력된다", async () => {
    render(<EntryFlowClient />);

    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.change(screen.getByLabelText("타석"), { target: { value: "12" } });

    expect(screen.getByLabelText("타석")).toHaveValue("10");
  });

  it("1단계에서 뒤로가기를 하면 이탈 확인 모달을 보여준다", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-26T18:12:00"));

    render(<EntryFlowClient />);

    const hourSelect = screen.getByLabelText("시 선택");
    const nextHourValue = Array.from(hourSelect.options)
      .map((option) => option.value)
      .find((value) => value !== hourSelect.value);

    expect(nextHourValue).toBeTruthy();
    fireEvent.change(hourSelect, { target: { value: nextHourValue } });

    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByRole("dialog", { name: "기록 입력 중단 확인" })).toBeInTheDocument();
    expect(screen.getByText("기록 입력을 중단할까요?")).toBeInTheDocument();

    vi.useRealTimers();
  });
});
