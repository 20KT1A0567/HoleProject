package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.dto.CartItemRequest;
import com.vrtechnologies.ecommerce.dto.CartItemResponse;
import com.vrtechnologies.ecommerce.dto.CartItemUpdateRequest;
import com.vrtechnologies.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> get(Authentication auth) {
        return ResponseEntity.ok(cartService.getCart(auth.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemResponse> add(@RequestBody CartItemRequest req, Authentication auth) {
        return ResponseEntity.ok(cartService.add(auth.getName(), req));
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody CartItemUpdateRequest req, Authentication auth) {
        CartItemResponse updated = cartService.update(auth.getName(), req);
        return updated == null
                ? ResponseEntity.ok(Map.of("removed", true))
                : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Map<String, Object>> remove(@PathVariable Long itemId, Authentication auth) {
        cartService.remove(auth.getName(), itemId);
        return ResponseEntity.ok(Map.of("removed", true));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, Object>> clear(Authentication auth) {
        cartService.clear(auth.getName());
        return ResponseEntity.ok(Map.of("cleared", true));
    }
}
