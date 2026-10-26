package com.vrtechnologies.ecommerce.repository;

import com.vrtechnologies.ecommerce.entity.Address;
import com.vrtechnologies.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserOrderByDefaultAddressDescCreatedAtDesc(User user);
}
