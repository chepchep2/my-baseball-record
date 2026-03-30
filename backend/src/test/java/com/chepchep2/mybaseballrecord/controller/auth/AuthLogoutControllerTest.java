package com.chepchep2.mybaseballrecord.controller.auth;

import com.chepchep2.mybaseballrecord.infrastructure.auth.RefreshTokenCookieManager;
import com.chepchep2.mybaseballrecord.service.auth.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseCookie;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthLogoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private RefreshTokenCookieManager refreshTokenCookieManager;

    @Test
    @DisplayName("POST /api/auth/logout - refreshToken cookie가 있으면 204를 반환한다")
    void postAuthLogoutReturnsNoContent() throws Exception {
        org.mockito.BDDMockito.given(refreshTokenCookieManager.clearRefreshTokenCookie())
                .willReturn(ResponseCookie.from("refreshToken", "").path("/api/auth").maxAge(0).build());

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "valid.refresh.token")))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("refreshToken", 0));

        verify(authService).logout("valid.refresh.token");
        verify(refreshTokenCookieManager).clearRefreshTokenCookie();
    }

    @Test
    @DisplayName("POST /api/auth/logout - refreshToken cookie가 없으면 4xx 에러를 반환한다")
    void postAuthLogoutValidationErrorWhenRefreshTokenBlank() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().is4xxClientError());
    }
}
