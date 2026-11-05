package com.atelier.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="users")
public class User{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,unique=true) public String email;
 public String phone;
 @Column(name="full_name",nullable=false) public String fullName;
 @Column(name="password_hash",nullable=false) public String passwordHash;
 @Column(nullable=false) public String role; // CUSTOMER, ARTIST, ADMIN
 public String address;
 public boolean active=true;
 @Column(name="created_at",nullable=false) public LocalDateTime createdAt=LocalDateTime.now();
}
