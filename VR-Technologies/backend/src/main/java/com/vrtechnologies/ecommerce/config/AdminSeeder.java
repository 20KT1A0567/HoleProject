package com.vrtechnologies.ecommerce.config;

import com.vrtechnologies.ecommerce.entity.User;
import com.vrtechnologies.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email:admin@vr.com}")
    private String adminEmail;

    @Value("${app.bootstrap.admin-password:admin123}")
    private String adminPassword;

    @Value("${app.bootstrap.admin-name:Super Admin}")
    private String adminName;

    @Override
    public void run(String... args) {
        var existing = userRepository.findByEmail(adminEmail);

        if (existing.isPresent()) {
            User user = existing.get();
            boolean changed = false;
            if (user.getRole() != User.Role.SUPER_ADMIN) {
                log.warn("AdminSeeder: upgrading {} from {} to SUPER_ADMIN", adminEmail, user.getRole());
                user.setRole(User.Role.SUPER_ADMIN);
                changed = true;
            }
            if (!user.isActive()) {
                user.setActive(true);
                changed = true;
            }
            if (changed) userRepository.save(user);
            else log.info("AdminSeeder: super admin already present ({})", adminEmail);
            return;
        }

        userRepository.save(User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(User.Role.SUPER_ADMIN)
                .active(true)
                .build());
        log.warn("AdminSeeder: created SUPER_ADMIN {} (CHANGE THE PASSWORD)", adminEmail);
    }
}
