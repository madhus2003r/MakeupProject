package com.atelier.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="otp_codes")
public class Otp{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public String email;
 public String purpose;
 @Column(name="code_hash") public String codeHash;
 @Column(name="expires_at") public LocalDateTime expiresAt;
 public int attempts=0;
 @Column(name="created_at") public LocalDateTime createdAt=LocalDateTime.now();
}
