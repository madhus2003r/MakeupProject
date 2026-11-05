package com.atelier.repository;
import com.atelier.entity.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepo extends JpaRepository<User,Long>{
 Optional<User> findByEmail(String email);
 boolean existsByEmail(String email);
 boolean existsByRole(String role);
 List<User> findByRole(String role);
}
