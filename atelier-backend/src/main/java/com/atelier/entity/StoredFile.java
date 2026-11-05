package com.atelier.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="stored_files")
public class StoredFile{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(name="owner_id") public long ownerId;
 public String kind; // ID or PORTFOLIO
 @Column(name="original_name") public String originalName;
 @Column(name="stored_name") public String storedName;
 @Column(name="content_type") public String contentType;
 @Column(name="size_bytes") public long sizeBytes;
 @Column(name="created_at") public LocalDateTime createdAt=LocalDateTime.now();
}
