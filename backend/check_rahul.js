const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRahul() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const [emp] = await conn.query('SELECT email FROM employees WHERE email = "rahul@company.com"');
  const [usr] = await conn.query('SELECT email FROM users WHERE email = "rahul@company.com"');
  
  console.log('Rahul in employees:', emp.length > 0);
  console.log('Rahul in users:', usr.length > 0);
  
  await conn.end();
}

checkRahul();
