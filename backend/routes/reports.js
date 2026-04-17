const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/reports
// @desc    Get dashboard metrics and reports
router.get('/', protect, async (req, res) => {
  try {
    // Basic stats
    // Basic stats
    let empFilter = '';

    let empParams = [];
    if (req.user.role === 'employee') {
      empFilter = ' WHERE email = ?';
      empParams = [req.user.email];
    }

    
    // Total Employees (Always company-wide)
    const [[{ total_employees }]] = await db.query('SELECT COUNT(*) as total_employees FROM employees');
    
    // Payroll Stats (Filtered by role for sensitive totals, but counts can be global)
    let payrollFilter = ' WHERE status != "pending"';
    let payrollParams = [];
    if (req.user.role === 'employee') {
      payrollFilter += ' AND employee_id = (SELECT id FROM employees WHERE email = ?)';
      payrollParams = [req.user.email];
    }

    const [[{ total_gross, total_deductions, total_net }]] = await db.query('SELECT SUM(gross) as total_gross, SUM(deductions) as total_deductions, SUM(net_salary) as total_net FROM payroll' + payrollFilter, payrollParams);
    
    // Processed Count (Always company-wide for dashboard visibility)
    const [[{ processed_count }]] = await db.query('SELECT COUNT(*) as processed_count FROM payroll WHERE status != "pending" AND (status = "processed" OR status = "paid")');
    
    // Paid Count (Always company-wide for dashboard visibility)
    const [[{ paid_count }]] = await db.query('SELECT COUNT(*) as paid_count FROM payroll WHERE status = "paid"');


    // Department Distribution
    const [dept_distribution] = await db.query('SELECT department, COUNT(*) as count FROM employees' + empFilter + ' GROUP BY department', empParams);

    // Monthly Trend
    const [monthly_trend] = await db.query(`
      SELECT CONCAT(month, ' ', year) as month_year, 
             SUM(gross) as total_gross, 
             SUM(deductions) as total_deductions, 
             SUM(net_salary) as total_net
      FROM payroll
      ${payrollFilter}
      GROUP BY year, month
      ORDER BY year ASC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') ASC
      LIMIT 12
    `, payrollParams);

    // Recent Payments
    const [recent_payments] = await db.query(`
      SELECT p.month, p.year, p.net_salary, p.status, e.name as employee_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      ${payrollFilter.replace('WHERE', 'AND').replace('AND', 'WHERE')}
      ORDER BY p.id DESC
      LIMIT 5
    `, payrollParams);

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
