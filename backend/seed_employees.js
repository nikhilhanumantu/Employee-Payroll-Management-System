const db = require('./config/db');

async function seed() {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM employees');
    console.log(`Current employee count: ${rows[0].count}`);

    const employees = [
      ['EMP001', 'John Doe', 'IT', 'Software Engineer', 'john.doe@company.com', 75000.00],
      ['EMP002', 'Jane Smith', 'HR', 'HR Manager', 'jane.smith@company.com', 65000.00],
      ['EMP003', 'Robert Brown', 'Finance', 'Accountant', 'robert.brown@company.com', 60000.00],
      ['EMP004', 'Emily Davis', 'Marketing', 'Digital Marketer', 'emily.davis@company.com', 55000.00],
      ['EMP005', 'Michael Wilson', 'Sales', 'Sales Executive', 'michael.wilson@company.com', 50000.00],
      ['EMP006', 'Sarah Johnson', 'Operations', 'Operations Lead', 'sarah.johnson@company.com', 70000.00],
      ['EMP007', 'Chris Miller', 'Design', 'UI/UX Designer', 'chris.miller@company.com', 62000.00],
      ['EMP008', 'Amanda Taylor', 'Engineering', 'Project Manager', 'amanda.taylor@company.com', 85000.00],
      ['EMP009', 'David Thomas', 'Support', 'Customer Support', 'david.thomas@company.com', 45000.00],
      ['EMP010', 'Laura White', 'Legal', 'Legal Advisor', 'laura.white@company.com', 90000.00]
    ];

    for (const emp of employees) {
      try {
        await db.query(
          'INSERT INTO employees (id, name, department, designation, email, basic_salary) VALUES (?, ?, ?, ?, ?, ?)',
          emp
        );
        console.log(`Inserted ${emp[1]}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Employee ${emp[1]} already exists, skipping.`);
        } else {
          console.error(`Error inserting ${emp[1]}:`, err.message);
        }
      }
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
