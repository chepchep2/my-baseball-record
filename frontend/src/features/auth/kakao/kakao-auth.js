function renderButton(element) {
  element.innerHTML = "";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "kakao-login-button";
  button.textContent = "카카오로 시작하기";
  element.appendChild(button);

  return button;
}

export async function mountKakaoLoginButton({ element, onSuccess, onError }) {
  if (!element) {
    return {
      ok: false,
      message: "카카오 로그인 버튼을 표시할 수 없습니다.",
      cleanup: () => {},
    };
  }

  try {
    const button = renderButton(element);
    const handleClick = async () => {
      try {
        await onSuccess("mock-kakao-token");
      } catch (error) {
        onError?.(error?.message || "카카오 로그인에 실패했습니다.");
      }
    };

    button.addEventListener("click", handleClick);

    return {
      ok: true,
      cleanup: () => {
        button.removeEventListener("click", handleClick);
        element.innerHTML = "";
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "카카오 로그인 버튼을 표시할 수 없습니다.",
      cleanup: () => {},
    };
  }
}
