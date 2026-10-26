package com.vrtechnologies.ecommerce.service;

import com.vrtechnologies.ecommerce.dto.InventoryRequest;
import com.vrtechnologies.ecommerce.entity.Product;
import com.vrtechnologies.ecommerce.entity.ProductStoreInventory;
import com.vrtechnologies.ecommerce.entity.Store;
import com.vrtechnologies.ecommerce.repository.ProductRepository;
import com.vrtechnologies.ecommerce.repository.ProductStoreInventoryRepository;
import com.vrtechnologies.ecommerce.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductStoreInventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> matrix() {
        List<Product> products = productRepository.findAll();
        List<Store> stores = storeRepository.findAll();
        Map<Long, List<ProductStoreInventory>> byProduct = new HashMap<>();
        inventoryRepository.findAll().forEach(inv ->
                byProduct.computeIfAbsent(inv.getProduct().getId(), ignored -> new ArrayList<>()).add(inv));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Product product : products) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", product.getId());
            row.put("productId", product.getId());
            row.put("product", product.getName());
            row.put("sku", product.getSku());
            row.put("image", product.getImages() != null && !product.getImages().isEmpty() ? product.getImages().get(0).getImageUrl() : null);

            int total = 0;
            List<ProductStoreInventory> productInventory = byProduct.getOrDefault(product.getId(), List.of());
            for (Store store : stores) {
                int qty = productInventory.stream()
                        .filter(inv -> inv.getStore().getId().equals(store.getId()))
                        .map(ProductStoreInventory::getStockQuantity)
                        .findFirst()
                        .orElse(0);
                total += qty;
                row.put(storeKey(store), qty);
                row.put("store_" + store.getId(), qty);
            }
            row.put("total", total);
            rows.add(row);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> lowStock(int threshold) {
        return inventoryRepository.findByStockQuantityLessThanEqual(threshold).stream()
                .map(inv -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    Product p = inv.getProduct();
                    row.put("productId", p.getId());
                    row.put("product", p.getName());
                    row.put("storeId", inv.getStore().getId());
                    row.put("store", inv.getStore().getName());
                    row.put("stock", inv.getStockQuantity());
                    row.put("image", p.getImages() != null && !p.getImages().isEmpty() ? p.getImages().get(0).getImageUrl() : null);
                    return row;
                })
                .toList();
    }

    @Transactional
    public ProductStoreInventory update(InventoryRequest req) {
        if (req.getProductId() == null || req.getStoreId() == null) {
            throw new IllegalArgumentException("productId and storeId are required");
        }
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        Store store = storeRepository.findById(req.getStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        ProductStoreInventory inv = inventoryRepository.findByProductIdAndStoreId(product.getId(), store.getId())
                .orElseGet(() -> ProductStoreInventory.builder().product(product).store(store).stockQuantity(0).build());
        inv.setStockQuantity(Math.max(0, req.getQuantity() == null ? 0 : req.getQuantity()));
        return inventoryRepository.save(inv);
    }

    private String storeKey(Store store) {
        String name = store.getName() == null ? "store" + store.getId() : store.getName();
        String key = name.toLowerCase(Locale.ROOT)
                .replace("vr technologies", "")
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", "_");
        return key.isBlank() ? "store_" + store.getId() : key;
    }
}
