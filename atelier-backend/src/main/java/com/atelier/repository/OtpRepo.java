package com.atelier.repository;
import com.atelier.entity.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OtpRepo extends JpaRepository<Otp,Long>{
 Optional<Otp> findFirstByEmailAndPurposeOrderByIdDesc(String email,String purpose);
 void deleteByEmailAndPurpose(String email,String purpose);
}
