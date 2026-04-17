const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    const [users] = await connection.query('SELECT id, name, email, role FROM users');
    console.log('--- Users ---');
    console.table(users);
  } catch (error) {
    console.error(error);
  } finally {
    await connection.end();
  }
}

checkUsers();
