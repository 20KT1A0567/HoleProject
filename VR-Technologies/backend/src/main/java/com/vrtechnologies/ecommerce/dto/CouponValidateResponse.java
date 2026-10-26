package com.vrtechnologies.ecommerce.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CouponValidateResponse {
    private boolean valid;
    private BigDecimal discount;
    private String message;
}
