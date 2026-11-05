package com.atelier.repository;
import com.atelier.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FileRepo extends JpaRepository<StoredFile,Long>{
 long countByOwnerIdAndKind(long ownerId,String kind);
}
