CREATE DATABASE IF NOT EXISTS heritage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE heritage_db;
CREATE TABLE IF NOT EXISTS administrative_units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS cultural_spaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255) NOT NULL,
  maximum_capacity INT NOT NULL,
  conservation_status ENUM('operational', 'maintenance', 'closed') NOT NULL,
  administrative_unit_id INT NOT NULL,
  CONSTRAINT chk_maximum_capacity CHECK (maximum_capacity > 0),
  CONSTRAINT fk_space_unit FOREIGN KEY (administrative_unit_id) REFERENCES administrative_units(id)
);
INSERT INTO administrative_units (name) VALUES ('Department of Culture'), ('City Heritage Office')
ON DUPLICATE KEY UPDATE name = VALUES(name);
