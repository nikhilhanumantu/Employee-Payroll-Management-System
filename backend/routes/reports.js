const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/reports
// @desc    Get dashboard metrics and reports
router.get('/', protect, async (req, res) => {
  try {
    // Basic stats
    const [[{ total_employees }]] = await db.query('SELECT COUNT(*) as total_employees FROM employees');
    
    const [[{ total_gross, total_deductions, total_net }]] = await db.query('SELECT SUM(gross) as total_gross, SUM(deductions) as total_deductions, SUM(net_salary) as total_net FROM payroll WHERE status != "pending"');
    
    const [[{ processed_count }]] = await db.query('SELECT COUNT(*) as processed_count FROM payroll WHERE status = "processed" OR status = "paid"');
    
    const [[{ paid_count }]] = await db.query('SELECT COUNT(*) as paid_count FROM payroll WHERE status = "paid"');

    // Department Distribution
    const [dept_distribution] = await db.query('SELECT department, COUNT(*) as count FROM employees GROUP BY department');

    // Monthly Trend (Last 6 months approximation by grouping)
    const [monthly_trend] = await db.query(`
      SELECT CONCAT(month, ' ', year) as month_year, 
             SUM(gross) as total_gross, 
             SUM(deductions) as total_deductions, 
             SUM(net_salary) as total_net
      FROM payroll
      GROUP BY year, month
      ORDER BY year ASC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') ASC
      LIMIT 12
    `);

    // Recent Payments
    const [recent_payments] = await db.query(`
      SELECT p.month, p.year, p.net_salary, p.status, e.name as employee_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.id DESC
      LIMIT 5
    `);

    res.json({
      total_employees,
      total_gross: total_gross || 0,
      total_deductions: total_deductions || 0,
      total_net: total_net || 0,
      processed_count,
      paid_count,
      dept_distribution,
      monthly_trend,
      recent_payments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
