package com.vrtechnologies.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
    private String phone;
}
