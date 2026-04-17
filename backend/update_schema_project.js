const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
  });

  try {
    console.log('Updating database with project requirements (logs, view, trigger)...');
    
    // Create Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        message VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create View
    await connection.query(`
      CREATE OR REPLACE VIEW payroll_summary AS
      SELECT e.name, e.department, p.month, p.net_salary, p.status
      FROM employees e
      JOIN payroll p ON e.id = p.employee_id
    `);

    // Create Trigger
    // Note: Node mysql2 doesn't support DELIMITER statement, so we just run the CREATE TRIGGER directly
    await connection.query('DROP TRIGGER IF EXISTS after_payroll_insert');
    await connection.query(`
      CREATE TRIGGER after_payroll_insert
      AFTER INSERT ON payroll
      FOR EACH ROW
      BEGIN
        INSERT INTO logs(message)
        VALUES (CONCAT('Payroll generated for Employee ID: ', NEW.employee_id));
      END
    `);

    console.log('Database updated successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await connection.end();
  }
}

updateDB();
