const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/payroll
// @desc    Get all payroll records
router.get('/', protect, async (req, res) => {
  const { month, year } = req.query;
  try {
    let query = `
      SELECT p.*, e.name as employee_name, e.department, e.designation, e.basic_salary, a.present, a.working_days
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN attendance a ON p.employee_id = a.employee_id AND p.month = a.month AND p.year = a.year
      WHERE 1=1
    `;
    const queryParams = [];

    if (req.user.role === 'employee') {
      query += ` AND e.email = ?`;
      queryParams.push(req.user.email);
    }

    if (month && year) {
      query += ` AND p.month = ? AND p.year = ?`;
      queryParams.push(month, year);
    }
    query += ` ORDER BY p.id DESC`;

    const [payroll] = await db.query(query, queryParams);
    res.json(payroll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/payroll/process
// @desc    Process or recalculate payroll or mark as paid
router.post('/process', protect, adminOnly, async (req, res) => {
  const { employee_id, month, year, manual_deductions, action } = req.body;
  // If action is 'pay', we just update the status
  if (action === 'pay') {
    try {
      await db.query('UPDATE payroll SET status = "paid" WHERE employee_id = ? AND month = ? AND year = ?', [employee_id, month, year]);
      return res.json({ message: 'Marked as paid' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Calculate and process
  try {
    // 1. Get Employee Basic Salary
    const [employees] = await db.query('SELECT basic_salary FROM employees WHERE id = ?', [employee_id]);
    if (employees.length === 0) return res.status(404).json({ message: 'Employee not found' });
    const basic_salary = parseFloat(employees[0].basic_salary);

    // 2. Get Attendance
    const [attendance] = await db.query('SELECT present, working_days FROM attendance WHERE employee_id = ? AND month = ? AND year = ?', [employee_id, month, year]);
    if (attendance.length === 0) return res.status(404).json({ message: 'Attendance not marked for this month' });
    
    const present = attendance[0].present;
    const working_days = attendance[0].working_days;

    // 3. Calculate calculations
    let gross = basic_salary;
    let auto_deductions = 0;
    
    if (working_days > 0) {
      const daily_rate = basic_salary / working_days;
      // Subtracting basic salary for days not present
      auto_deductions = (working_days - present) * daily_rate;
    }
    
    // Add manual and auto deductions
    let manual_ded = parseFloat(manual_deductions) || 0;
    let deductions = auto_deductions + manual_ded;
    
    let net_salary = gross - deductions;
    if (net_salary < 0) net_salary = 0; // Prevent negative salary

    // Check if payroll already exists
    const [existing] = await db.query('SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?', [employee_id, month, year]);
    
    if (existing.length > 0) {
      await db.query(
        'UPDATE payroll SET gross = ?, deductions = ?, net_salary = ?, status = "processed" WHERE id = ?',
        [gross.toFixed(2), deductions.toFixed(2), net_salary.toFixed(2), existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO payroll (employee_id, month, year, gross, deductions, net_salary, status) VALUES (?, ?, ?, ?, ?, ?, "processed")',
        [employee_id, month, year, gross.toFixed(2), deductions.toFixed(2), net_salary.toFixed(2)]
      );
    }

    res.json({ message: 'Payroll processed successfully', data: { gross, deductions, net_salary } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
