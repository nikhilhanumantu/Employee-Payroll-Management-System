const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/employees
// @desc    Get all employees
router.get('/', protect, async (req, res) => {
  try {
    const [employees] = await db.query('SELECT * FROM employees');
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/employees
// @desc    Add new employee
router.post('/', protect, adminOnly, async (req, res) => {
  const { id, name, department, designation, email, basic_salary } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO employees (id, name, department, designation, email, basic_salary) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, department, designation, email, basic_salary]
    );
    res.status(201).json({ message: 'Employee added successfully', id });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Employee ID or Email already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { name, department, designation, email, basic_salary } = req.body;
  try {
    await db.query(
      'UPDATE employees SET name = ?, department = ?, designation = ?, email = ?, basic_salary = ? WHERE id = ?',
      [name, department, designation, email, basic_salary, req.params.id]
    );
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
