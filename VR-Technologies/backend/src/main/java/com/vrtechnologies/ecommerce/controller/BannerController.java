package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Banner;
import com.vrtechnologies.ecommerce.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BannerController {

    private final BannerRepository bannerRepository;

    @GetMapping("/api/banners")
    public ResponseEntity<List<Banner>> publicList() {
        return ResponseEntity.ok(bannerRepository.findAll(Sort.by("id").descending())
                .stream().filter(b -> "Active".equalsIgnoreCase(b.getStatus())).toList());
    }

    @GetMapping("/api/admin/banners")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<List<Banner>> adminList() {
        return ResponseEntity.ok(bannerRepository.findAll(Sort.by("id").descending()));
    }

    @PostMapping("/api/admin/banners")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<Banner> create(@RequestBody Banner b) {
        b.setId(null);
        return ResponseEntity.ok(bannerRepository.save(b));
    }

    @PutMapping("/api/admin/banners/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<Banner> update(@PathVariable Long id, @RequestBody Banner updated) {
        return bannerRepository.findById(id).map(b -> {
            if (updated.getTitle() != null) b.setTitle(updated.getTitle());
            if (updated.getImage() != null) b.setImage(updated.getImage());
            if (updated.getVideo() != null) b.setVideo(updated.getVideo());
            if (updated.getPosition() != null) b.setPosition(updated.getPosition());
            if (updated.getStartDate() != null) b.setStartDate(updated.getStartDate());
            if (updated.getEndDate() != null) b.setEndDate(updated.getEndDate());
            if (updated.getStatus() != null) b.setStatus(updated.getStatus());
            return ResponseEntity.ok(bannerRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/banners/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bannerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
