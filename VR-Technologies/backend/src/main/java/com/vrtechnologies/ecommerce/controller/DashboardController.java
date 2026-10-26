package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Order;
import com.vrtechnologies.ecommerce.entity.Product;
import com.vrtechnologies.ecommerce.entity.User;
import com.vrtechnologies.ecommerce.repository.OrderRepository;
import com.vrtechnologies.ecommerce.repository.ProductRepository;
import com.vrtechnologies.ecommerce.repository.StoreRepository;
import com.vrtechnologies.ecommerce.repository.UserRepository;
import com.vrtechnologies.ecommerce.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'SUPPORT')")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final InventoryService inventoryService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal revenue = orders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalRevenue", revenue);
        out.put("totalSales", revenue);
        out.put("totalOrders", orders.size());
        out.put("totalProducts", productRepository.count());
        out.put("totalCustomers", userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.CUSTOMER).count());
        out.put("totalStores", storeRepository.count());
        out.put("totalOrdersChange", 18.7);
        out.put("totalSalesChange", 22.5);
        out.put("totalProductsChange", 8.7);
        out.put("totalCustomersChange", 16.7);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/sales-chart")
    public ResponseEntity<List<Map<String, Object>>> salesChart() {
        Map<LocalDate, BigDecimal> byDay = new TreeMap<>();
        for (Order o : orderRepository.findAll()) {
            if (o.getCreatedAt() == null || o.getTotalAmount() == null) continue;
            byDay.merge(o.getCreatedAt().toLocalDate(), o.getTotalAmount(), BigDecimal::add);
        }
        return ResponseEntity.ok(byDay.entrySet().stream()
                .map(e -> Map.<String, Object>of("date", e.getKey().toString(), "sales", e.getValue(), "revenue", e.getValue()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/order-overview")
    public ResponseEntity<List<Map<String, Object>>> orderOverview() {
        Map<Order.OrderStatus, Long> counts = orderRepository.findAll().stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
        Map<Order.OrderStatus, String> colors = new EnumMap<>(Order.OrderStatus.class);
        colors.put(Order.OrderStatus.DELIVERED, "#22C55E");
        colors.put(Order.OrderStatus.PROCESSING, "#3B82F6");
        colors.put(Order.OrderStatus.OUT_FOR_DELIVERY, "#F59E0B");
        colors.put(Order.OrderStatus.CANCELLED, "#EF4444");
        return ResponseEntity.ok(counts.entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "name", e.getKey().name().replace("_", " "),
                        "status", e.getKey().name(),
                        "value", e.getValue(),
                        "count", e.getValue(),
                        "color", colors.getOrDefault(e.getKey(), "#8B5CF6")))
                .collect(Collectors.toList()));
    }

    @GetMapping("/sales-by-store")
    public ResponseEntity<List<Map<String, Object>>> salesByStore() {
        Map<String, BigDecimal> byStore = new LinkedHashMap<>();
        for (Order o : orderRepository.findAll()) {
            if (o.getTotalAmount() == null) continue;
            String store = o.getStore() != null && o.getStore().getName() != null ? o.getStore().getName() : "Unassigned";
            byStore.merge(store, o.getTotalAmount(), BigDecimal::add);
        }
        return ResponseEntity.ok(byStore.entrySet().stream()
                .map(e -> Map.<String, Object>of("store", e.getKey(), "sales", e.getValue(), "revenue", e.getValue()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Map<String, Object>>> lowStock() {
        return ResponseEntity.ok(inventoryService.lowStock(5));
    }

    @GetMapping("/store-summary")
    public ResponseEntity<List<Map<String, Object>>> storeSummary() {
        return ResponseEntity.ok(storeRepository.findAll().stream().map(s -> {
            List<Order> storeOrders = orderRepository.findAll().stream()
                    .filter(o -> o.getStore() != null && Objects.equals(o.getStore().getId(), s.getId()))
                    .toList();
            BigDecimal sales = storeOrders.stream()
                    .filter(o -> o.getTotalAmount() != null)
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return Map.<String, Object>of(
                    "store", s.getName() == null ? "" : s.getName(),
                    "orders", storeOrders.size(),
                    "sales", sales,
                    "status", s.isActive() ? "Active" : "Inactive");
        }).collect(Collectors.toList()));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> topProducts() {
        List<Product> products = productRepository.findAll().stream().limit(5).toList();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            Product p = products.get(i);
            rows.add(Map.<String, Object>of(
                    "rank", i + 1,
                    "product", p.getName(),
                    "image", p.getImages() != null && !p.getImages().isEmpty() ? p.getImages().get(0).getImageUrl() : "",
                    "sold", 0,
                    "revenue", BigDecimal.ZERO,
                    "store", "All Stores"));
        }
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/activities")
    public ResponseEntity<List<Map<String, Object>>> activities() {
        return ResponseEntity.ok(orderRepository.findAll().stream()
                .sorted(Comparator.comparing((Order o) -> o.getCreatedAt() == null ? LocalDateTime.MIN : o.getCreatedAt()).reversed())
                .limit(10)
                .map(o -> Map.<String, Object>of(
                        "icon", "order",
                        "type", "ORDER",
                        "text", "Order " + o.getOrderNumber() + " - " + o.getStatus(),
                        "message", "Order " + o.getOrderNumber() + " - " + o.getStatus(),
                        "time", o.getCreatedAt() == null ? "" : o.getCreatedAt().toString(),
                        "at", o.getCreatedAt() == null ? "" : o.getCreatedAt().toString()))
                .collect(Collectors.toList()));
    }
}
