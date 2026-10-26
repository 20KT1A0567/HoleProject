package com.vrtechnologies.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String state;
    private String phone;
    private String whatsapp;
    private String timings;
    private String mapLink;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private boolean active = true;
}
