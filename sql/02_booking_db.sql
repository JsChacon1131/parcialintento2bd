CREATE DATABASE IF NOT EXISTS booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_db;
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  space_id INT NOT NULL,
  organization_id INT NOT NULL,
  attendees INT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservation_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT chk_reservation_attendees CHECK (attendees > 0),
  CONSTRAINT chk_reservation_schedule CHECK (start_at < end_at),
  INDEX idx_space_status_schedule (space_id, status, start_at, end_at)
);
CREATE TABLE IF NOT EXISTS occupancy_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL UNIQUE,
  space_id INT NOT NULL,
  occupied_from DATETIME NOT NULL,
  occupied_until DATETIME NOT NULL,
  attendees INT NOT NULL,
  CONSTRAINT fk_occupancy_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);
INSERT INTO organizations (name) VALUES ('Community Cultural Association'), ('Public Arts Foundation')
ON DUPLICATE KEY UPDATE name = VALUES(name);
