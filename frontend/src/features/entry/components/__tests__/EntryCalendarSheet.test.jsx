import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EntryCalendarSheet from "../EntryCalendarSheet";

describe("EntryCalendarSheet", () => {
  it("열리면 바텀시트 달력과 연월 선택을 보여준다", async () => {
    render(
      <EntryCalendarSheet
        open
        selectedDate="2026-03-25"
        onClose={vi.fn()}
        onSelectDate={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "날짜 선택" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /2026년 3월/ }));
    expect(screen.getByLabelText("연도 선택")).toBeInTheDocument();
    expect(screen.getByLabelText("월 선택")).toBeInTheDocument();
  });
});
