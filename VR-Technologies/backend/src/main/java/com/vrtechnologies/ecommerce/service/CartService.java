package com.vrtechnologies.ecommerce.service;

import com.vrtechnologies.ecommerce.dto.CartItemRequest;
import com.vrtechnologies.ecommerce.dto.CartItemResponse;
import com.vrtechnologies.ecommerce.dto.CartItemUpdateRequest;
import com.vrtechnologies.ecommerce.entity.*;
import com.vrtechnologies.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartRepo;
    private final ProductRepository productRepo;
    private final StoreRepository storeRepo;
    private final UserRepository userRepo;

    private User userByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
    }

    public List<CartItemResponse> getCart(String email) {
        return cartRepo.findByUser(userByEmail(email)).stream().map(this::toDto).toList();
    }

    public CartItemResponse add(String email, CartItemRequest req) {
        if (req.getProductId() == null) throw new IllegalArgumentException("productId required");
        int qty = req.getQuantity() == null || req.getQuantity() < 1 ? 1 : req.getQuantity();

        User user = userByEmail(email);
        Product product = productRepo.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        Store store = req.getStoreId() == null ? null : storeRepo.findById(req.getStoreId()).orElse(null);

        Optional<CartItem> existing = (store == null)
                ? cartRepo.findByUserIdAndProductIdAndStoreIsNull(user.getId(), product.getId())
                : cartRepo.findByUserIdAndProductIdAndStoreId(user.getId(), product.getId(), store.getId());

        CartItem item = existing.orElseGet(() -> CartItem.builder()
                .user(user).product(product).store(store).quantity(0).build());
        item.setQuantity(item.getQuantity() + qty);
        return toDto(cartRepo.save(item));
    }

    public CartItemResponse update(String email, CartItemUpdateRequest req) {
        if (req.getItemId() == null) throw new IllegalArgumentException("itemId required");
        CartItem item = cartRepo.findById(req.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        if (!item.getUser().getEmail().equals(email)) throw new SecurityException("Not your cart item");
        int qty = req.getQuantity() == null ? 1 : req.getQuantity();
        if (qty <= 0) {
            cartRepo.delete(item);
            return null;
        }
        item.setQuantity(qty);
        return toDto(cartRepo.save(item));
    }

    public void remove(String email, Long itemId) {
        CartItem item = cartRepo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        if (!item.getUser().getEmail().equals(email)) throw new SecurityException("Not your cart item");
        cartRepo.delete(item);
    }

    public void clear(String email) {
        cartRepo.deleteByUser(userByEmail(email));
    }

    private CartItemResponse toDto(CartItem item) {
        Product p = item.getProduct();
        BigDecimal price = p == null || p.getSellingPrice() == null ? BigDecimal.ZERO : p.getSellingPrice();
        BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
        String img = null;
        if (p != null && p.getImages() != null && !p.getImages().isEmpty()) {
            img = p.getImages().get(0).getImageUrl();
        }
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(p == null ? null : p.getId())
                .productName(p == null ? null : p.getName())
                .productImage(img)
                .price(price)
                .quantity(item.getQuantity())
                .storeId(item.getStore() == null ? null : item.getStore().getId())
                .storeName(item.getStore() == null ? null : item.getStore().getName())
                .lineTotal(lineTotal)
                .build();
    }
}
