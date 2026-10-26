package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.dto.InventoryRequest;
import com.vrtechnologies.ecommerce.entity.ProductStoreInventory;
import com.vrtechnologies.ecommerce.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/api/admin/inventory")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<List<Map<String, Object>>> all() {
        return ResponseEntity.ok(inventoryService.matrix());
    }

    @PutMapping("/api/admin/inventory")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<ProductStoreInventory> update(@RequestBody InventoryRequest req) {
        return ResponseEntity.ok(inventoryService.update(req));
    }
}
