package com.vrtechnologies.ecommerce.repository;

import com.vrtechnologies.ecommerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByApprovedOrderByCreatedAtDesc(boolean approved);
}
