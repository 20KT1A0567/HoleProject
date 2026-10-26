package com.vrtechnologies.ecommerce.config;

import com.vrtechnologies.ecommerce.entity.Brand;
import com.vrtechnologies.ecommerce.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class BrandSeeder implements CommandLineRunner {

    private final BrandRepository brandRepository;

    private static final List<String> DEFAULT_BRANDS = List.of(
            "Lenovo", "HP", "Dell", "Apple", "Asus", "Acer", "MSI", "Microsoft", "Samsung", "Toshiba"
    );

    @Override
    public void run(String... args) {
        int created = 0;
        for (String name : DEFAULT_BRANDS) {
            if (!brandRepository.existsByNameIgnoreCase(name)) {
                brandRepository.save(Brand.builder()
                        .name(name)
                        .active(true)
                        .build());
                created++;
            }
        }
        if (created > 0) log.info("BrandSeeder: inserted {} default brands", created);
    }
}
