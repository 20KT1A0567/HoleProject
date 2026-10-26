package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.entity.Address;
import com.vrtechnologies.ecommerce.entity.User;
import com.vrtechnologies.ecommerce.repository.AddressRepository;
import com.vrtechnologies.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Address>> all(Authentication auth) {
        return ResponseEntity.ok(addressRepository.findByUserOrderByDefaultAddressDescCreatedAtDesc(user(auth)));
    }

    @PostMapping
    public ResponseEntity<Address> create(@RequestBody Address address, Authentication auth) {
        User user = user(auth);
        address.setId(null);
        address.setUser(user);
        if (address.isDefaultAddress()) clearDefaults(user);
        return ResponseEntity.ok(addressRepository.save(address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> update(@PathVariable Long id, @RequestBody Address updated, Authentication auth) {
        User user = user(auth);
        Address existing = owned(id, user);
        if (updated.isDefaultAddress()) clearDefaults(user);
        updated.setId(existing.getId());
        updated.setUser(user);
        updated.setCreatedAt(existing.getCreatedAt());
        return ResponseEntity.ok(addressRepository.save(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        addressRepository.delete(owned(id, user(auth)));
        return ResponseEntity.noContent().build();
    }

    private User user(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private Address owned(Long id, User user) {
        Address address = addressRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) throw new SecurityException("Not your address");
        return address;
    }

    private void clearDefaults(User user) {
        addressRepository.findByUserOrderByDefaultAddressDescCreatedAtDesc(user).forEach(a -> {
            if (a.isDefaultAddress()) {
                a.setDefaultAddress(false);
                addressRepository.save(a);
            }
        });
    }
}
