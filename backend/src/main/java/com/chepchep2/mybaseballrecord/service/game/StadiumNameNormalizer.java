package com.chepchep2.mybaseballrecord.service.game;

import org.springframework.stereotype.Component;

@Component
public class StadiumNameNormalizer {
    public String normalize(String stadiumName) {
        if (stadiumName == null) {
            return "";
        }
        return stadiumName.trim().toLowerCase().replace(" ", "");
    }
}
