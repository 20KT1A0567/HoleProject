package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Order;
import com.vrtechnologies.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @PostMapping("/orders")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName()).orElseThrow();
        order.setUser(user);
        order.setOrderNumber("ORD" + System.currentTimeMillis());
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/orders/my")
    public ResponseEntity<List<Order>> myOrders(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id, Authentication auth) {
        return orderRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/orders")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderRepository.findAll(pageable));
    }

    @PutMapping("/admin/orders/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(Order.OrderStatus.valueOf(status));
            return ResponseEntity.ok(orderRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
