package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Category;
import com.vrtechnologies.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping("/api/categories")
    public ResponseEntity<List<Category>> publicList() {
        return ResponseEntity.ok(categoryRepository.findAll(Sort.by("name").ascending())
                .stream().filter(Category::isActive).toList());
    }

    @GetMapping("/api/admin/categories")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<List<Category>> adminList() {
        return ResponseEntity.ok(categoryRepository.findAll(Sort.by("name").ascending()));
    }

    @PostMapping("/api/admin/categories")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> create(@RequestBody Category c) {
        if (c.getName() == null || c.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category name required"));
        }
        if (categoryRepository.existsByNameIgnoreCase(c.getName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category already exists"));
        }
        c.setId(null);
        return ResponseEntity.ok(categoryRepository.save(c));
    }

    @PutMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category updated) {
        return categoryRepository.findById(id).map(c -> {
            if (updated.getName() != null) c.setName(updated.getName());
            if (updated.getIcon() != null) c.setIcon(updated.getIcon());
            if (updated.getDescription() != null) c.setDescription(updated.getDescription());
            c.setActive(updated.isActive());
            return ResponseEntity.ok(categoryRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
