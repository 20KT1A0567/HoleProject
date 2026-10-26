package com.vrtechnologies.ecommerce.dto;

import lombok.*;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
}
