package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Store;
import com.vrtechnologies.ecommerce.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping("/api/stores")
    public ResponseEntity<List<Store>> getAllStores() {
        return ResponseEntity.ok(storeRepository.findByActive(true));
    }

    @GetMapping("/api/stores/{id}")
    public ResponseEntity<Store> getStore(@PathVariable Long id) {
        return storeRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/admin/stores")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Store> createStore(@RequestBody Store store) {
        return ResponseEntity.ok(storeRepository.save(store));
    }

    @PutMapping("/api/admin/stores/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Store> updateStore(@PathVariable Long id, @RequestBody Store updated) {
        return storeRepository.findById(id).map(s -> {
            updated.setId(id);
            return ResponseEntity.ok(storeRepository.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/stores/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        storeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
