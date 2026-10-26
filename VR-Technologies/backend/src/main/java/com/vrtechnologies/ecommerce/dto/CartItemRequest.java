package com.vrtechnologies.ecommerce.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CartItemRequest {
    private Long productId;
    private Integer quantity;
    private Long storeId;
}
