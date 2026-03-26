import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EntryCalendarSheet from "../EntryCalendarSheet";

describe("EntryCalendarSheet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-26T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("열리면 바텀시트 달력과 연월 선택을 보여준다", () => {
    render(
      <EntryCalendarSheet
        variant="inline"
        selectedDate="2026-03-25"
        onSelectDate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /2026년 3월/ }));
    expect(screen.getByLabelText("연도 선택")).toBeInTheDocument();
    expect(screen.getByLabelText("월 선택")).toBeInTheDocument();
  });

  it("오늘 이후 날짜는 선택할 수 없다", () => {
    render(
      <EntryCalendarSheet
        variant="inline"
        selectedDate="2026-03-25"
        onSelectDate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "27" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "26" })).not.toBeDisabled();
  });
});
