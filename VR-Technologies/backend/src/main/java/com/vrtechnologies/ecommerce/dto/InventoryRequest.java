package com.vrtechnologies.ecommerce.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InventoryRequest {
    private Long productId;
    private Long storeId;
    private Integer quantity;
}
