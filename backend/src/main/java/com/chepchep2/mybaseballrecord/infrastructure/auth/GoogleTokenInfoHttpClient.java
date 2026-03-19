package com.chepchep2.mybaseballrecord.infrastructure.auth;

import com.chepchep2.mybaseballrecord.exception.auth.GoogleAuthFailedException;
import com.chepchep2.mybaseballrecord.exception.auth.InvalidGoogleTokenException;
import com.chepchep2.mybaseballrecord.service.auth.GoogleTokenInfoClient;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;

public class GoogleTokenInfoHttpClient implements GoogleTokenInfoClient {
    private final RestClient restClient;
    private final String tokenInfoPath;

    public GoogleTokenInfoHttpClient(RestClient restClient, String tokenInfoPath) {
        this.restClient = restClient;
        this.tokenInfoPath = tokenInfoPath;
    }

    @Override
    public GoogleTokenInfo fetch(String idToken) {
        GoogleTokenInfoResponse response;
        try {
            response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(tokenInfoPath)
                            .queryParam("id_token", idToken)
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new InvalidGoogleTokenException("Google token is invalid.");
                    })
                    .body(GoogleTokenInfoResponse.class);
        } catch (InvalidGoogleTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new GoogleAuthFailedException("Failed to call Google token info endpoint.");
        }

        if (response == null) {
            throw new GoogleAuthFailedException("Google token info response is empty.");
        }

        return new GoogleTokenInfo(
                response.sub(),
                response.email(),
                response.name(),
                response.aud(),
                response.exp()
        );
    }

    private record GoogleTokenInfoResponse(
            String sub,
            String email,
            String name,
            String aud,
            String exp
    ) {
    }
}
