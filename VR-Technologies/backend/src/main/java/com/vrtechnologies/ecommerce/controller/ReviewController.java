package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.dto.ReviewRequest;
import com.vrtechnologies.ecommerce.dto.ReviewResponse;
import com.vrtechnologies.ecommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/products/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> forProduct(@PathVariable("id") Long productId) {
        return ResponseEntity.ok(reviewService.forProduct(productId));
    }

    @PostMapping("/api/reviews")
    public ResponseEntity<ReviewResponse> add(@RequestBody ReviewRequest req, Authentication auth) {
        return ResponseEntity.ok(reviewService.add(auth.getName(), req));
    }

    @GetMapping("/api/admin/reviews")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'SUPPORT')")
    public ResponseEntity<List<ReviewResponse>> all() {
        return ResponseEntity.ok(reviewService.all());
    }

    @PatchMapping("/api/admin/reviews/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<ReviewResponse> approve(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(reviewService.setApproved(id, body.getOrDefault("approved", true)));
    }

    @DeleteMapping("/api/admin/reviews/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
