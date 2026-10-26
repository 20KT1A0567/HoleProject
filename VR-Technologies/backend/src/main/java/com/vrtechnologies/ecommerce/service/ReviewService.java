package com.vrtechnologies.ecommerce.service;

import com.vrtechnologies.ecommerce.dto.ReviewRequest;
import com.vrtechnologies.ecommerce.dto.ReviewResponse;
import com.vrtechnologies.ecommerce.entity.*;
import com.vrtechnologies.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<ReviewResponse> forProduct(Long productId) {
        return reviewRepo.findByProductIdOrderByCreatedAtDesc(productId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> all() {
        return reviewRepo.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public ReviewResponse add(String email, ReviewRequest req) {
        if (req.getProductId() == null || req.getRating() == null)
            throw new IllegalArgumentException("productId and rating required");
        if (req.getRating() < 1 || req.getRating() > 5)
            throw new IllegalArgumentException("rating must be 1-5");

        Product product = productRepo.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Review review = Review.builder()
                .product(product).user(user)
                .rating(req.getRating()).comment(req.getComment())
                .approved(true)
                .build();
        return toDto(reviewRepo.save(review));
    }

    @Transactional
    public void delete(Long id) { reviewRepo.deleteById(id); }

    @Transactional
    public ReviewResponse setApproved(Long id, boolean approved) {
        Review r = reviewRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Review not found"));
        r.setApproved(approved);
        return toDto(reviewRepo.save(r));
    }

    private ReviewResponse toDto(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProduct() == null ? null : r.getProduct().getId())
                .productName(r.getProduct() == null ? null : r.getProduct().getName())
                .userId(r.getUser() == null ? null : r.getUser().getId())
                .userName(r.getUser() == null ? null : r.getUser().getName())
                .rating(r.getRating())
                .comment(r.getComment())
                .approved(r.isApproved())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
