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

    expect(screen.getByRole("button", { name: "2026-03-27" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2026-03-26" })).not.toBeDisabled();
  });

  it("월 시작 요일에 맞춰 앞달 날짜부터 배치한다", () => {
    vi.setSystemTime(new Date("2026-05-31T10:00:00"));

    render(
      <EntryCalendarSheet
        variant="inline"
        selectedDate="2026-05-13"
        onSelectDate={vi.fn()}
      />,
    );

    const dayButtons = screen.getAllByRole("button").filter((element) => element.className.includes("calendar-day"));
    expect(dayButtons.slice(0, 7).map((element) => element.textContent)).toEqual(["26", "27", "28", "29", "30", "1", "2"]);
    expect(screen.getByLabelText("2026-05-01")).toBeInTheDocument();
  });

  it("앞달 날짜를 누르면 그 날짜를 선택하고 해당 월로 이동한다", () => {
    vi.setSystemTime(new Date("2026-05-31T10:00:00"));
    const onSelectDate = vi.fn();

    render(
      <EntryCalendarSheet
        variant="inline"
        selectedDate="2026-05-13"
        onSelectDate={onSelectDate}
      />,
    );

    fireEvent.click(screen.getByLabelText("2026-04-30"));

    expect(onSelectDate).toHaveBeenCalledWith("2026-04-30");
    expect(screen.getByRole("button", { name: /2026년 4월/ })).toBeInTheDocument();
  });

  it("미래에 해당하는 다음달 날짜는 disabled 상태를 유지한다", () => {
    vi.setSystemTime(new Date("2026-05-13T10:00:00"));

    render(
      <EntryCalendarSheet
        variant="inline"
        selectedDate="2026-05-13"
        onSelectDate={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("2026-06-01")).toBeDisabled();
  });
});
