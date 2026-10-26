package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Brand;
import com.vrtechnologies.ecommerce.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping("/api/brands")
    public ResponseEntity<List<Brand>> getActiveBrands() {
        return ResponseEntity.ok(brandRepository.findAll(Sort.by("name").ascending())
                .stream().filter(Brand::isActive).toList());
    }

    @GetMapping("/api/admin/brands")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<List<Brand>> getAll() {
        return ResponseEntity.ok(brandRepository.findAll(Sort.by("name").ascending()));
    }

    @PostMapping("/api/admin/brands")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> create(@RequestBody Brand brand) {
        if (brand.getName() == null || brand.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Brand name required"));
        }
        if (brandRepository.existsByNameIgnoreCase(brand.getName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Brand already exists"));
        }
        brand.setId(null);
        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @PutMapping("/api/admin/brands/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<Brand> update(@PathVariable Long id, @RequestBody Brand updated) {
        return brandRepository.findById(id).map(b -> {
            if (updated.getName() != null) b.setName(updated.getName());
            if (updated.getLogo() != null) b.setLogo(updated.getLogo());
            b.setActive(updated.isActive());
            return ResponseEntity.ok(brandRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/brands/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        brandRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
