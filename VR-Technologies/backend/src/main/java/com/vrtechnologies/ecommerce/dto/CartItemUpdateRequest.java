package com.vrtechnologies.ecommerce.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CartItemUpdateRequest {
    private Long itemId;
    private Integer quantity;
}
