-- ============================================================
-- BITSchool Management System — MySQL Database Schema
-- Database: bitschool_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS `bitschool_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bitschool_db`;

-- Disable Foreign Key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

-- Re-enable Foreign Key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. ROLES TABLE (System User Roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Principal Administrator Role
INSERT INTO `roles` (`id`, `name`, `description`) 
VALUES (1, 'Principal Administrator', 'Full institutional administrative access & system authority')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ============================================================
-- 2. USERS TABLE (User Accounts & Authentication Credentials)
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `regNo` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `roleId` INT NOT NULL,
  `avatarColor` VARCHAR(20) DEFAULT '#2563eb',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Principal Administrator User: Gowtham
INSERT INTO `users` (`id`, `name`, `regNo`, `email`, `password`, `roleId`, `avatarColor`)
VALUES (
  'user-gowtham-001', 
  'Gowtham', 
  '7376242IT163', 
  'gowthamnaveen124@gmail.com', 
  '$2a$10$iM.oG9VwL4kIeUu1oX2D6.JkYtC1Vz4F2TzLz/m1JbFwK2VvVw3KG', -- '1234'
  1, 
  '#2563eb'
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
