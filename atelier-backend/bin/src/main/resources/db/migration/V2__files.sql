CREATE TABLE stored_files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT NOT NULL,
  kind VARCHAR(20) NOT NULL,
  original_name VARCHAR(255),
  stored_name VARCHAR(80) NOT NULL,
  content_type VARCHAR(40) NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at DATETIME(3) NOT NULL,
  INDEX idx_files_owner (owner_id, kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
