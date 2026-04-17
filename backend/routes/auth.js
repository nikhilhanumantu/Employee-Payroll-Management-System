const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @route   POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/register
router.post('/register', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' });
  }

  const { email, password } = req.body;



  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();


    // 1. Check if employee exists in records (Added by Admin)
    const [employee] = await conn.query('SELECT name FROM employees WHERE email = ?', [email]);
    if (employee.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Email not found in employee records. Please contact your Admin.' });
    }

    // 2. Check if user already has a login account
    const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    
    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser.length > 0) {
      // Update existing account
      await conn.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
      await conn.commit();
      return res.status(200).json({ message: 'Password updated successfully.' });
    } else {
      // Create new account
      await conn.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "employee")',
        [employee[0].name, email, hashedPassword]
      );
      await conn.commit();
      return res.status(201).json({ message: 'Account created successfully.' });
    }


  } catch (error) {
    if (conn) await conn.rollback();
    console.error(error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  } finally {
    if (conn) conn.release();
  }

});

module.exports = router;
