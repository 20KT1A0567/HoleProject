package com.vrtechnologies.ecommerce.repository;

import com.vrtechnologies.ecommerce.entity.ProductStoreInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductStoreInventoryRepository extends JpaRepository<ProductStoreInventory, Long> {
    Optional<ProductStoreInventory> findByProductIdAndStoreId(Long productId, Long storeId);
    List<ProductStoreInventory> findByProductId(Long productId);
    List<ProductStoreInventory> findByStoreId(Long storeId);
    List<ProductStoreInventory> findByStockQuantityLessThanEqual(Integer threshold);
}
