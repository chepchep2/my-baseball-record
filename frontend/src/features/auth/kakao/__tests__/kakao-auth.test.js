import { describe, expect, it, vi } from "vitest";
import { mountKakaoLoginButton } from "../kakao-auth";

describe("kakao-auth", () => {
  it("host element가 없으면 실패 결과를 반환한다", async () => {
    const result = await mountKakaoLoginButton({
      element: null,
      onSuccess: vi.fn(),
      onError: vi.fn(),
    });

    expect(result.ok).toBe(false);
    expect(result.message).toBe("카카오 로그인 버튼을 표시할 수 없습니다.");
  });

  it("버튼 클릭 시 success callback을 호출하고 cleanup으로 제거한다", async () => {
    const host = document.createElement("div");
    const onSuccess = vi.fn();

    const result = await mountKakaoLoginButton({
      element: host,
      onSuccess,
      onError: vi.fn(),
    });

    expect(result.ok).toBe(true);

    host.querySelector("button")?.click();
    expect(onSuccess).toHaveBeenCalledWith("mock-kakao-token");

    result.cleanup();
    expect(host.innerHTML).toBe("");
  });
});
