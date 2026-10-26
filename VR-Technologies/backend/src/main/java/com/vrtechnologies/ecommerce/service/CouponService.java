package com.vrtechnologies.ecommerce.service;

import com.vrtechnologies.ecommerce.dto.CouponValidateRequest;
import com.vrtechnologies.ecommerce.dto.CouponValidateResponse;
import com.vrtechnologies.ecommerce.entity.Coupon;
import com.vrtechnologies.ecommerce.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepo;

    @Transactional(readOnly = true)
    public List<Coupon> all() {
        return couponRepo.findAll();
    }

    @Transactional
    public Coupon create(Coupon c) {
        if (c.getCode() == null || c.getCode().isBlank())
            throw new IllegalArgumentException("Coupon code required");
        if (couponRepo.existsByCodeIgnoreCase(c.getCode()))
            throw new IllegalArgumentException("Coupon code already exists");
        c.setId(null);
        if (c.getUsedCount() == null) c.setUsedCount(0);
        c.setCode(c.getCode().toUpperCase());
        return couponRepo.save(c);
    }

    @Transactional
    public Coupon update(Long id, Coupon updated) {
        Coupon existing = couponRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        if (updated.getCode() != null) existing.setCode(updated.getCode().toUpperCase());
        if (updated.getType() != null) existing.setType(updated.getType());
        if (updated.getDiscountValue() != null) existing.setDiscountValue(updated.getDiscountValue());
        if (updated.getMinOrderAmount() != null) existing.setMinOrderAmount(updated.getMinOrderAmount());
        if (updated.getUsageLimit() != null) existing.setUsageLimit(updated.getUsageLimit());
        if (updated.getExpiryDate() != null) existing.setExpiryDate(updated.getExpiryDate());
        existing.setActive(updated.isActive());
        return couponRepo.save(existing);
    }

    @Transactional
    public void delete(Long id) { couponRepo.deleteById(id); }

    @Transactional(readOnly = true)
    public CouponValidateResponse validate(CouponValidateRequest req) {
        if (req.getCode() == null || req.getAmount() == null) {
            return CouponValidateResponse.builder().valid(false).discount(BigDecimal.ZERO).message("Invalid request").build();
        }
        var opt = couponRepo.findByCodeIgnoreCase(req.getCode().trim());
        if (opt.isEmpty()) {
            return CouponValidateResponse.builder().valid(false).discount(BigDecimal.ZERO).message("Invalid coupon code").build();
        }
        Coupon c = opt.get();
        if (!c.isActive()) {
            return CouponValidateResponse.builder().valid(false).discount(BigDecimal.ZERO).message("Coupon is inactive").build();
        }
        if (c.getExpiryDate() != null && c.getExpiryDate().isBefore(LocalDate.now())) {
            return CouponValidateResponse.builder().valid(false).discount(BigDecimal.ZERO).message("Coupon has expired").build();
        }
        if (c.getUsageLimit() != null && c.getUsedCount() != null && c.getUsedCount() >= c.getUsageLimit()) {
            return CouponValidateResponse.builder().valid(false).discount(BigDecimal.ZERO).message("Coupon usage limit reached").build();
        }
        if (c.getMinOrderAmount() != null && req.getAmount().compareTo(c.getMinOrderAmount()) < 0) {
            return CouponValidateResponse.builder().valid(false).discount(BigDecimal.ZERO)
                    .message("Minimum order ₹" + c.getMinOrderAmount() + " required").build();
        }

        BigDecimal discount;
        if (c.getType() == Coupon.DiscountType.PERCENTAGE) {
            discount = req.getAmount().multiply(c.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = c.getDiscountValue();
        }
        if (discount.compareTo(req.getAmount()) > 0) discount = req.getAmount();

        String label = c.getType() == Coupon.DiscountType.PERCENTAGE
                ? c.getDiscountValue() + "% off applied!"
                : "₹" + c.getDiscountValue() + " off applied!";
        return CouponValidateResponse.builder().valid(true).discount(discount).message(label).build();
    }
}
