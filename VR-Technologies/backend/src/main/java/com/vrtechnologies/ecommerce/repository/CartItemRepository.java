package com.vrtechnologies.ecommerce.repository;

import com.vrtechnologies.ecommerce.entity.CartItem;
import com.vrtechnologies.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserIdAndProductIdAndStoreId(Long userId, Long productId, Long storeId);
    Optional<CartItem> findByUserIdAndProductIdAndStoreIsNull(Long userId, Long productId);
    void deleteByUser(User user);
}
