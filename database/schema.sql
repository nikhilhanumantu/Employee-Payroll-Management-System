CREATE DATABASE IF NOT EXISTS payroll_db;
USE payroll_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'employee')
);

INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@company.com', '$2b$10$qbE3YG7MQdKEYjsoDx3caeXW4KGPg4xkF.GXt6slF1H0QYO6BiomK', 'admin'),
('Employee User', 'employee@company.com', '$2b$10$ZAz0K53AOMrD7d8uHXX.W.A6k2fMWezT0P67M3u9uP.z1nINwDPOy', 'employee');

CREATE TABLE employees (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255),
  department VARCHAR(100),
  designation VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  basic_salary DECIMAL(10, 2)
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(10),
  month VARCHAR(20),
  year INT,
  present INT,
  absent INT,
  leaves INT,
  working_days INT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(10),
  month VARCHAR(20),
  year INT,
  gross DECIMAL(10, 2),
  deductions DECIMAL(10, 2),
  net_salary DECIMAL(10, 2),
  status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);