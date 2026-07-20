import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import EntryStepCounts from "../EntryStepCounts";

vi.mock("@/features/entry/components/useKeyboardInset", () => ({
  default: () => 260,
}));

const originalUserAgent = navigator.userAgent;

const fields = [
  { key: "plateAppearances", label: "타석" },
  { key: "walksAndHitByPitch", label: "사사구" },
  { key: "singles", label: "1루타" },
  { key: "doubles", label: "2루타" },
  { key: "triples", label: "3루타" },
  { key: "homeRuns", label: "홈런" },
];

function buildValues(overrides = {}) {
  return {
    date: "2026-03-27",
    hour: "19",
    minute: "00",
    plateAppearances: "4",
    walksAndHitByPitch: "0",
    singles: "0",
    doubles: "0",
    triples: "0",
    homeRuns: "0",
    ...overrides,
  };
}

const matchFields = [
  { key: "plateAppearances", label: "타석" },
  { key: "walksAndHitByPitch", label: "사사구" },
  { key: "sacrificeBunts", label: "희생번트" },
  { key: "sacrificeFlies", label: "희생플라이" },
  { key: "singles", label: "1루타" },
  { key: "doubles", label: "2루타" },
  { key: "triples", label: "3루타" },
  { key: "homeRuns", label: "홈런" },
];

function buildMatchValues(overrides = {}) {
  return {
    date: "2026-03-27",
    hour: "19",
    minute: "00",
    plateAppearances: "6",
    walksAndHitByPitch: "0",
    sacrificeBunts: "0",
    sacrificeFlies: "0",
    singles: "0",
    doubles: "0",
    triples: "0",
    homeRuns: "0",
    ...overrides,
  };
}

describe("EntryStepCounts keyboard accessory", () => {
  afterEach(() => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it("iPhone에서는 키보드가 열리면 키보드 위 다음 버튼을 보여준다", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X)",
    });

    render(
      <EntryStepCounts
        fields={fields}
        values={buildValues()}
        error={null}
        canProceed
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
  });

  it("iPhone에서는 키보드 위 다음 버튼으로 다음 필드로 이동한다", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X)",
    });

    render(
      <EntryStepCounts
        fields={fields}
        values={buildValues()}
        error={null}
        canProceed
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(screen.getByLabelText("사사구")).toHaveFocus());
  });

  it("Android에서는 키보드가 열리면 화면 버튼을 숨긴다", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Linux; Android 15; Pixel 9)",
    });

    render(
      <EntryStepCounts
        fields={fields}
        values={buildValues()}
        error={null}
        canProceed
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "다음" })).not.toBeInTheDocument();
  });

  it("matches 입력에서는 타수가 0이어도 희생플라이를 다시 수정할 수 있다", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X)",
    });

    render(
      <EntryStepCounts
        fields={matchFields}
        values={buildMatchValues({ sacrificeFlies: "6" })}
        error={null}
        canProceed
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        hitFieldStartIndex={4}
      />,
    );

    const sacrificeFliesInput = screen.getByLabelText("희생플라이");
    const singlesInput = screen.getByLabelText("1루타");

    expect(sacrificeFliesInput).toBeEnabled();
    expect(singlesInput).toBeDisabled();

    await userEvent.click(screen.getByLabelText("희생번트"));
    await waitFor(() => expect(screen.getByLabelText("희생번트")).toHaveFocus());
  });
});
