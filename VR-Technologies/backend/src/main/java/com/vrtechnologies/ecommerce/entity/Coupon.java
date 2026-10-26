package com.vrtechnologies.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private DiscountType type;

    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private Integer usageLimit;
    private Integer usedCount = 0;
    private LocalDate expiryDate;
    private boolean active = true;

    public enum DiscountType { PERCENTAGE, FIXED }
}
