package com.vrtechnologies.ecommerce.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CouponValidateRequest {
    private String code;
    private BigDecimal amount;
}
