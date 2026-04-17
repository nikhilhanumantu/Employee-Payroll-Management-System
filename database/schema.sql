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

INSERT INTO employees (id, name, department, designation, email, basic_salary) VALUES 
('EMP001', 'John Doe', 'IT', 'Software Engineer', 'john.doe@company.com', 75000.00),
('EMP002', 'Jane Smith', 'Human Resources', 'HR Manager', 'jane.smith@company.com', 65000.00),
('EMP003', 'Robert Brown', 'Finance', 'Accountant', 'robert.brown@company.com', 60000.00),
('EMP004', 'Emily Davis', 'Marketing', 'Digital Marketer', 'emily.davis@company.com', 55000.00),
('EMP005', 'Michael Wilson', 'Sales', 'Sales Executive', 'michael.wilson@company.com', 50000.00),
('EMP006', 'Sarah Johnson', 'Operations', 'Operations Lead', 'sarah.johnson@company.com', 70000.00),
('EMP007', 'Chris Miller', 'Design', 'UI/UX Designer', 'chris.miller@company.com', 62000.00),
('EMP008', 'Amanda Taylor', 'Engineering', 'Project Manager', 'amanda.taylor@company.com', 85000.00),
('EMP009', 'David Thomas', 'Support', 'Customer Support', 'david.thomas@company.com', 45000.00),
('EMP010', 'Laura White', 'Legal', 'Legal Advisor', 'laura.white@company.com', 90000.00);

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

-- =========================================
-- LOG TABLE (FOR TRIGGER)
-- =========================================
CREATE TABLE IF NOT EXISTS logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  message VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- VIEW 
-- =========================================
CREATE OR REPLACE VIEW payroll_summary AS
SELECT e.name, e.department, p.month, p.net_salary, p.status
FROM employees e
JOIN payroll p ON e.id = p.employee_id;

-- =========================================
-- TRIGGER 
-- =========================================
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS after_payroll_insert
AFTER INSERT ON payroll
FOR EACH ROW
BEGIN
  INSERT INTO logs(message)
  VALUES (CONCAT('Payroll generated for Employee ID: ', NEW.employee_id));
END$$

DELIMITER ;