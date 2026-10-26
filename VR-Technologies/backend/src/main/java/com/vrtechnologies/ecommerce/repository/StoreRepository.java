package com.vrtechnologies.ecommerce.repository;

import com.vrtechnologies.ecommerce.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByActive(boolean active);
}
