package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Store;
import com.vrtechnologies.ecommerce.entity.User;
import com.vrtechnologies.ecommerce.repository.OrderRepository;
import com.vrtechnologies.ecommerce.repository.StoreRepository;
import com.vrtechnologies.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class AdminMiscController {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/api/admin/customers")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'SUPPORT')")
    public ResponseEntity<List<Map<String, Object>>> customers() {
        List<Map<String, Object>> rows = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "name", u.getName() == null ? "" : u.getName(),
                        "email", u.getEmail(),
                        "phone", u.getPhone() == null ? "" : u.getPhone(),
                        "status", u.isActive() ? "Active" : "Inactive",
                        "active", u.isActive(),
                        "createdAt", u.getCreatedAt() == null ? "" : u.getCreatedAt().toString()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/api/admin/stores")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'SUPPORT')")
    public ResponseEntity<List<Store>> stores() {
        return ResponseEntity.ok(storeRepository.findAll());
    }

    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> adminUsers() {
        List<Map<String, Object>> rows = userRepository.findAll().stream()
                .filter(u -> u.getRole() != User.Role.CUSTOMER)
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "name", u.getName() == null ? "" : u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name(),
                        "status", u.isActive() ? "Active" : "Inactive",
                        "active", u.isActive(),
                        "createdAt", u.getCreatedAt() == null ? "" : u.getCreatedAt().toString()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(rows);
    }

    @PostMapping("/api/admin/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createAdminUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.getOrDefault("name", email);
        String password = body.get("password");
        String roleStr = body.getOrDefault("role", "SALES_STAFF");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        User.Role role;
        try {
            role = User.Role.valueOf(roleStr);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + roleStr));
        }
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .active(true)
                .build();
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAdminUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/reports/revenue-trend")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> revenueTrend() {
        Map<String, BigDecimal> byMonth = new TreeMap<>();
        orderRepository.findAll().forEach(o -> {
            if (o.getCreatedAt() == null || o.getTotalAmount() == null) return;
            String month = o.getCreatedAt().getYear() + "-" + String.format("%02d", o.getCreatedAt().getMonthValue());
            byMonth.merge(month, o.getTotalAmount(), BigDecimal::add);
        });
        return ResponseEntity.ok(byMonth.entrySet().stream()
                .map(e -> Map.<String, Object>of("month", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/api/admin/reports/sales-by-store")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> salesByStore() {
        Map<String, BigDecimal> byStore = new LinkedHashMap<>();
        orderRepository.findAll().forEach(o -> {
            if (o.getTotalAmount() == null) return;
            String store = o.getStore() != null && o.getStore().getName() != null ? o.getStore().getName() : "Unassigned";
            byStore.merge(store, o.getTotalAmount(), BigDecimal::add);
        });
        return ResponseEntity.ok(byStore.entrySet().stream()
                .map(e -> Map.<String, Object>of("store", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/api/admin/reports/sales-by-category")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> salesByCategory() {
        return ResponseEntity.ok(List.of());
    }
}
