USE payroll_db;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message VARCHAR(255),
  type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample notifications
INSERT INTO notifications (user_id, message, type) VALUES 
(1, 'Welcome to PayrollPro Admin Panel', 'info'),
(2, 'Your payroll for March 2026 has been processed', 'success');
