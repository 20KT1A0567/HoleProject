package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Product;
import com.vrtechnologies.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    // Public endpoints
    @GetMapping("/api/products")
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        Page<Product> products;
        if (search != null && !search.isBlank()) {
            products = productRepository.findByNameContainingIgnoreCaseAndVisibleOnWebsite(search, true, pageable);
        } else if (brand != null) {
            products = productRepository.findByBrandAndVisibleOnWebsite(brand, true, pageable);
        } else if (category != null) {
            products = productRepository.findByCategoryAndVisibleOnWebsite(category, true, pageable);
        } else {
            products = productRepository.findByVisibleOnWebsite(true, pageable);
        }
        return ResponseEntity.ok(products);
    }

    @GetMapping("/api/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/products/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productRepository.findByFeaturedOnHomepageAndVisibleOnWebsite(true, true));
    }

    // Admin endpoints
    @PostMapping("/api/admin/products")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('STORE_MANAGER')")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/api/admin/products/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('STORE_MANAGER')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product updated) {
        return productRepository.findById(id).map(p -> {
            updated.setId(id);
            return ResponseEntity.ok(productRepository.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/products/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/products")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<List<Product>> getAllProductsAdmin() {
        return ResponseEntity.ok(productRepository.findAll());
    }
}
