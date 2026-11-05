package com.atelier.service;

import java.util.List;
import java.util.Optional;
import com.atelier.entity.User;

public interface UserService {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    boolean existsByEmail(String email);
    boolean existsByRole(String role);
    List<User> findByRole(String role);
    User save(User user);
}
