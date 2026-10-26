package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Product;
import com.vrtechnologies.ecommerce.entity.User;
import com.vrtechnologies.ecommerce.entity.WishlistItem;
import com.vrtechnologies.ecommerce.repository.ProductRepository;
import com.vrtechnologies.ecommerce.repository.UserRepository;
import com.vrtechnologies.ecommerce.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistItemRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<WishlistItem>> all(Authentication auth) {
        return ResponseEntity.ok(wishlistRepository.findByUserOrderByCreatedAtDesc(user(auth)));
    }

    @PostMapping
    public ResponseEntity<WishlistItem> add(@RequestBody Map<String, Long> body, Authentication auth) {
        Long productId = body.get("productId");
        if (productId == null) throw new IllegalArgumentException("productId required");
        User user = user(auth);
        return wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                    return ResponseEntity.ok(wishlistRepository.save(WishlistItem.builder().user(user).product(product).build()));
                });
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@PathVariable Long productId, Authentication auth) {
        wishlistRepository.deleteByUserIdAndProductId(user(auth).getId(), productId);
        return ResponseEntity.noContent().build();
    }

    private User user(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
