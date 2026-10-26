package com.vrtechnologies.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_store_inventory", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "store_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductStoreInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private Integer stockQuantity = 0;
}
