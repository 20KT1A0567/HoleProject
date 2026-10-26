package com.vrtechnologies.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String modelNumber;
    private String brand;
    private String category;
    private String processor;
    private String processorGeneration;
    private Integer ramGb;
    private Integer storageGb;
    private String storageType;
    private String graphics;
    private String displaySize;
    private String displayType;
    private String operatingSystem;

    @Enumerated(EnumType.STRING)
    private Condition condition;

    private String grade;
    private String batteryNote;
    private String weight;

    @Column(nullable = false)
    private BigDecimal sellingPrice;

    private BigDecimal originalPrice;
    private Integer discountPercent;
    private Integer warrantyMonths;
    private Integer returnDays;

    @Column(unique = true)
    private String sku;

    private String serialNumber;
    private String warrantySummary;

    @Column(columnDefinition = "TEXT")
    private String description;

    private boolean visibleOnWebsite = true;
    private boolean featuredOnHomepage = false;
    private boolean active = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductImage> images;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductStoreInventory> storeInventories;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum Condition { LIKE_NEW, EXCELLENT, GOOD, FAIR }
}
