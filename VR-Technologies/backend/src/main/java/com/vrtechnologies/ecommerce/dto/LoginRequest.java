package com.vrtechnologies.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
}
