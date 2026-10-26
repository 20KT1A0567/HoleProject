package com.vrtechnologies.ecommerce.repository;

import com.vrtechnologies.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByVisibleOnWebsite(boolean visible, Pageable pageable);
    Page<Product> findByBrandAndVisibleOnWebsite(String brand, boolean visible, Pageable pageable);
    Page<Product> findByCategoryAndVisibleOnWebsite(String category, boolean visible, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndVisibleOnWebsite(String name, boolean visible, Pageable pageable);
    List<Product> findByFeaturedOnHomepageAndVisibleOnWebsite(boolean featured, boolean visible);
}
