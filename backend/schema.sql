-- ============================================================
-- BITSchool Management System — Local MySQL Database Schema
-- Database: bitschool_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS `bitschool_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bitschool_db`;

-- 1. USERS TABLE (Principal Administrator Auth)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Principal Administrator',
  `workspace` VARCHAR(100) NOT NULL DEFAULT 'Executive Administration',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Principal Admin
INSERT INTO `users` (`id`, `name`, `email`, `role`, `workspace`)
VALUES ('admin-001', 'Dr. Robert Vance', 'admin@bitschool.edu', 'Principal Administrator', 'Executive Administration')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. VENUES TABLE (Classrooms & Labs)
CREATE TABLE IF NOT EXISTS `venues` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `room_no` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'normal',
  `capacity` INT NOT NULL DEFAULT 40,
  `building` VARCHAR(100) DEFAULT 'Main Block',
  `floor` VARCHAR(50) DEFAULT '1st Floor',
  `status` VARCHAR(50) DEFAULT 'Available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Venues
INSERT INTO `venues` (`id`, `room_no`, `name`, `type`, `capacity`, `building`, `floor`) VALUES
('v1', 'Room 101', 'Grade 8-A Classroom', 'normal', 40, 'Main Block', '1st Floor'),
('v2', 'Room 102', 'Smart Classroom 102', 'projector', 45, 'Main Block', '1st Floor'),
('v3', 'Room 103', 'Grade 9-B Classroom', 'normal', 40, 'Main Block', '1st Floor'),
('v4', 'Room 201', 'Smart Classroom 201', 'projector', 45, 'Science Wing', '2nd Floor'),
('v5', 'Room 202', 'Grade 10-B Classroom', 'normal', 42, 'Science Wing', '2nd Floor'),
('v6', 'Room 301', 'Smart Classroom 301', 'projector', 40, 'Senior Block', '3rd Floor'),
('v7', 'Lab A', 'Advanced Computer Lab', 'computer_lab', 50, 'Tech Wing', '2nd Floor'),
('v8', 'Lab B', 'Central Science Lab', 'science_lab', 45, 'Science Wing', '1st Floor'),
('v9', 'Audi-1', 'Main Auditorium', 'auditorium', 250, 'Activity Center', 'Ground Floor')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. CLASSES TABLE (Grade & Section Setup)
CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `grade` VARCHAR(20) NOT NULL,
  `section` VARCHAR(20) NOT NULL,
  `student_count` INT NOT NULL DEFAULT 35,
  `home_venue_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`home_venue_id`) REFERENCES `venues`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Classes
INSERT INTO `classes` (`id`, `name`, `grade`, `section`, `student_count`, `home_venue_id`) VALUES
('c1', 'Grade 8-A', '8', 'A', 36, 'v1'),
('c2', 'Grade 9-A', '9', 'A', 40, 'v2'),
('c3', 'Grade 9-B', '9', 'B', 38, 'v3'),
('c4', 'Grade 10-A', '10', 'A', 42, 'v4'),
('c5', 'Grade 10-B', '10', 'B', 41, 'v5'),
('c6', 'Grade 11-A', '11', 'A', 35, 'v6')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. SUBJECTS TABLE (Master Course Curriculum)
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `weekly_periods` INT NOT NULL DEFAULT 5,
  `required_venue_type` VARCHAR(50) DEFAULT 'normal',
  `color` VARCHAR(20) DEFAULT '#2563eb',
  `target_grade` VARCHAR(20) DEFAULT 'all',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Subjects
INSERT INTO `subjects` (`id`, `code`, `name`, `weekly_periods`, `required_venue_type`, `color`) VALUES
('s1', 'MATH101', 'Mathematics', 8, 'projector', '#4f46e5'),
('s2', 'ENG101', 'English Literature', 6, 'normal', '#2563eb'),
('s3', 'PHY101', 'Physics', 5, 'projector', '#7c3aed'),
('s4', 'CHEM101', 'Chemistry', 5, 'science_lab', '#059669'),
('s5', 'CS101', 'Computer Science', 6, 'computer_lab', '#0891b2'),
('s6', 'BIO101', 'Biology', 4, 'science_lab', '#16a34a'),
('s7', 'HIST101', 'History & Civics', 4, 'normal', '#d97706'),
('s8', 'GEO101', 'Geography', 4, 'projector', '#ca8a04'),
('s9', 'PE101', 'Physical Education', 3, 'normal', '#dc2626'),
('s10', 'ART101', 'Art & Craft', 3, 'normal', '#db2777')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. FACULTIES TABLE
CREATE TABLE IF NOT EXISTS `faculties` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `emp_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `primary_subject_id` VARCHAR(50) NULL,
  `max_periods_per_day` INT DEFAULT 5,
  `max_periods_per_week` INT DEFAULT 25,
  `status` VARCHAR(20) DEFAULT 'Active',
  `avatar_color` VARCHAR(20) DEFAULT '#2563eb',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`primary_subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ECA VERTICALS TABLE (Extra Curricular Activity Categories)
CREATE TABLE IF NOT EXISTS `eca_verticals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed ECA Verticals
INSERT INTO `eca_verticals` (`name`) VALUES
('Keyboard'),
('Classical Dance / Table tennis'),
('Violin / Movie session / Handwriting practice'),
('Table tennis'),
('Western Dance'),
('Chess'),
('Physical Fitness'),
('English song'),
('Ted ex video')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 7. ECA SCHEDULES TABLE (Activity Matrix Slots)
CREATE TABLE IF NOT EXISTS `eca_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `day` VARCHAR(20) NOT NULL,
  `vertical_name` VARCHAR(150) NOT NULL,
  `active` TINYINT(1) DEFAULT 0,
  `label` VARCHAR(100) DEFAULT 'No',
  `duration` VARCHAR(50) DEFAULT '30 mins',
  `target` VARCHAR(50) DEFAULT 'All',
  `color` VARCHAR(20) DEFAULT '#059669',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `day_vertical` (`day`, `vertical_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. TIMETABLES TABLE (Week-Keyed Scheduled Slots)
CREATE TABLE IF NOT EXISTS `timetables` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `week_key` VARCHAR(20) NOT NULL,
  `class_id` VARCHAR(50) NOT NULL,
  `day` VARCHAR(20) NOT NULL,
  `period` INT NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `faculty_id` VARCHAR(50) NOT NULL,
  `venue_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_week_class` (`week_key`, `class_id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
