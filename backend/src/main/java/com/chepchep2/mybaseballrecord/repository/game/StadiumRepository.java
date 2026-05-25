package com.chepchep2.mybaseballrecord.repository.game;

import com.chepchep2.mybaseballrecord.domain.game.Stadium;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StadiumRepository extends JpaRepository<Stadium, Long> {
    List<Stadium> findAllByCityNameAndDistrictNameOrderByStadiumNameAsc(String cityName, String districtName);

    Optional<Stadium> findByCityNameAndDistrictNameAndNormalizedName(
            String cityName,
            String districtName,
            String normalizedName
    );
}
