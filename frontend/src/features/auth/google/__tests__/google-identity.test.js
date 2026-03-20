import { describe, expect, it, vi, afterEach } from "vitest";
import { mountGoogleSignInButton, triggerGoogleSignIn } from "../google-identity";

describe("google-identity", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    delete window.google;
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  });

  it("실제 Google 버튼이 DOM에 붙은 뒤에만 준비 완료를 반환한다", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "google-client-id";

    window.google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn((element) => {
            setTimeout(() => {
              const button = document.createElement("button");
              button.type = "button";
              button.textContent = "continue with google";
              element.appendChild(button);
            }, 0);
          }),
        },
      },
    };

    const host = document.createElement("div");

    const resultPromise = mountGoogleSignInButton({
      element: host,
      onCredential: vi.fn(),
      onError: vi.fn(),
    });

    const result = await resultPromise;

    expect(result).toEqual({ ok: true });
    expect(host.querySelector("button")).not.toBeNull();
  });

  it("준비된 Google 버튼이 있으면 클릭을 위임한다", () => {
    const host = document.createElement("div");
    const button = document.createElement("button");
    button.type = "button";
    button.click = vi.fn();
    host.appendChild(button);

    const result = triggerGoogleSignIn(host);

    expect(result).toEqual({ ok: true });
    expect(button.click).toHaveBeenCalledTimes(1);
  });
});
