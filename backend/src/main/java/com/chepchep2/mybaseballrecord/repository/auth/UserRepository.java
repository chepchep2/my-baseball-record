package com.chepchep2.mybaseballrecord.repository.auth;

import com.chepchep2.mybaseballrecord.domain.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderSubject(String provider, String providerSubject);
}
