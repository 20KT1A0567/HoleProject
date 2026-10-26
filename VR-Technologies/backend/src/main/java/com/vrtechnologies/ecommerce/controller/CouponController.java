package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.dto.CouponValidateRequest;
import com.vrtechnologies.ecommerce.dto.CouponValidateResponse;
import com.vrtechnologies.ecommerce.entity.Coupon;
import com.vrtechnologies.ecommerce.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // Public (authenticated)
    @PostMapping("/api/coupons/validate")
    public ResponseEntity<CouponValidateResponse> validate(@RequestBody CouponValidateRequest req) {
        return ResponseEntity.ok(couponService.validate(req));
    }

    // Admin
    @GetMapping("/api/admin/coupons")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<List<Coupon>> all() { return ResponseEntity.ok(couponService.all()); }

    @PostMapping("/api/admin/coupons")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<Coupon> create(@RequestBody Coupon c) {
        return ResponseEntity.ok(couponService.create(c));
    }

    @PutMapping("/api/admin/coupons/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<Coupon> update(@PathVariable Long id, @RequestBody Coupon updated) {
        return ResponseEntity.ok(couponService.update(id, updated));
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
