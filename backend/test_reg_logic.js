const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function testRegister() {
    const email = 'rahul@company.com';
    const password = 'password123';
    
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        
        console.log('Checking employee...');
        const [employee] = await conn.query('SELECT name FROM employees WHERE email = ?', [email]);
        console.log('Employee found:', employee);
        
        if (employee.length === 0) {
            console.log('Employee not found');
            return;
        }
        
        console.log('Checking existing user...');
        const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
        console.log('Existing user:', existingUser);
        
        if (existingUser.length > 0) {
            console.log('User already exists');
            return;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('Creating user...');
        await conn.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "employee")',
            [employee[0].name, email, hashedPassword]
        );
        
        await conn.commit();
        console.log('Success!');
    } catch (error) {
        await conn.rollback();
        console.error('Error:', error);
    } finally {
        conn.release();
        process.exit();
    }
}

testRegister();
