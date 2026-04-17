const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('Creating notifications table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        message VARCHAR(255),
        type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Check if sample notifications exist
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM notifications');
    if (rows[0].count === 0) {
      console.log('Inserting sample notifications...');
      await connection.query('INSERT INTO notifications (user_id, message, type) VALUES (1, "Welcome to PayrollPro Admin Panel", "info"), (2, "Your payroll for March 2026 has been processed", "success")');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initDB();
