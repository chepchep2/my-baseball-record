const GOOGLE_IDENTITY_SCRIPT_URL = "https://accounts.google.com/gsi/client";

let scriptLoadingPromise = null;

function getGoogleClientId() {
  if (typeof process === "undefined" || !process.env) {
    return "";
  }
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 Google 로그인을 사용할 수 있습니다."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google 로그인 스크립트를 불러오지 못했습니다.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google 로그인 스크립트를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export async function mountGoogleSignInButton({ element, onCredential, onError }) {
  if (!element) {
    return { ok: false, message: "Google 로그인 버튼 컨테이너를 찾지 못했습니다." };
  }

  const clientId = getGoogleClientId();
  if (!clientId) {
    return {
      ok: false,
      message: "Google 로그인 설정이 없습니다. NEXT_PUBLIC_GOOGLE_CLIENT_ID를 확인해 주세요.",
    };
  }

  try {
    await loadGoogleIdentityScript();
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Google 로그인 초기화에 실패했습니다.",
    };
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response?.credential) {
        onCredential?.(response.credential);
        return;
      }

      onError?.("Google 인증 토큰을 가져오지 못했습니다.");
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  element.innerHTML = "";
  window.google.accounts.id.renderButton(element, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    width: element.clientWidth || 360,
    logo_alignment: "left",
  });

  return { ok: true };
}

export function triggerGoogleSignIn(element) {
  if (!element) {
    return { ok: false, message: "Google 로그인 버튼이 준비되지 않았습니다." };
  }

  const button = element.querySelector('div[role="button"], button');
  if (!button) {
    return { ok: false, message: "Google 로그인 버튼이 준비되지 않았습니다." };
  }

  button.click();
  return { ok: true };
}
