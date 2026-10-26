package com.vrtechnologies.ecommerce.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReviewRequest {
    private Long productId;
    private Integer rating;
    private String comment;
}
