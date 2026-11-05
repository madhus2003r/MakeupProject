package com.atelier.serviceimpl;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.atelier.entity.User;
import com.atelier.repository.UserRepo;
import com.atelier.service.UserService;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private final UserRepo repository;

    public UserServiceImpl(UserRepo repository) {
        this.repository = repository;
    }

    @Override public Optional<User> findByEmail(String email) { return repository.findByEmail(email); }
    @Override public Optional<User> findById(Long id) { return repository.findById(id); }
    @Override public boolean existsByEmail(String email) { return repository.existsByEmail(email); }
    @Override public boolean existsByRole(String role) { return repository.existsByRole(role); }
    @Override public List<User> findByRole(String role) { return repository.findByRole(role); }

    @Override
    @Transactional
    public User save(User user) {
        return repository.save(user);
    }
}
