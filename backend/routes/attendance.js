const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/attendance
// @desc    Get all attendance records
router.get('/', protect, async (req, res) => {
  const { month, year } = req.query;
  try {
    let query = `
      SELECT a.*, e.name as employee_name, e.department, e.designation 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (req.user.role === 'employee') {
      query += ` AND e.email = ?`;
      queryParams.push(req.user.email);
    }

    if (month && year) {
      query += ` AND a.month = ? AND a.year = ?`;
      queryParams.push(month, year);
    }

    const [attendance] = await db.query(query, queryParams);
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/attendance
// @desc    Mark or update attendance
router.post('/', protect, adminOnly, async (req, res) => {
  const { employee_id, month, year, present, absent, leaves, working_days } = req.body;
  try {
    // Check if record exists
    const [existing] = await db.query(
      'SELECT id FROM attendance WHERE employee_id = ? AND month = ? AND year = ?',
      [employee_id, month, year]
    );

    if (existing.length > 0) {
      // Update
      await db.query(
        'UPDATE attendance SET present=?, absent=?, leaves=?, working_days=? WHERE id=?',
        [present, absent, leaves, working_days, existing[0].id]
      );
      res.json({ message: 'Attendance updated successfully' });
    } else {
      // Mark New
      await db.query(
        'INSERT INTO attendance (employee_id, month, year, present, absent, leaves, working_days) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [employee_id, month, year, present, absent, leaves, working_days]
      );
      res.status(201).json({ message: 'Attendance marked successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
