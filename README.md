# 💼 Employee Payroll Management System

Production-ready Employee Payroll Management System built with Node.js, Express, MySQL, and modern web technologies.

---

## 🚀 Tech Stack

Backend: Node.js, Express  
Database: MySQL 8+ 🐬  
Frontend: HTML, CSS, JavaScript  
Authentication: JWT + Bcrypt  
Security & Middleware: Helmet, CORS, Rate Limiting, Input Validation  
Logging: Morgan / Winston  

---

## ✨ Core Features

Employee Management:
- Add, update, and delete employee records
- Store employee details securely in MySQL

Payroll System:
- Salary calculation based on role and attendance
- Generate payroll records with date & time
- Maintain salary history

Authentication System:
- Secure login/register with hashed passwords
- JWT-based session handling

Admin Dashboard:
- Manage employees and payroll data
- View salary reports
- Monitor system records

Database Operations:
- Structured relational schema using MySQL
- Efficient CRUD operations

---

## 👥 Roles

admin:
- Full system access
- Manage employees and payroll
- View reports and logs

employee:
- View personal details
- View salary/payroll records

---

## 🗄️ Database (MySQL)

This project uses **MySQL** as the core database for storing employee and payroll data.

### 🔹 MySQL Connection Example

```js

 config/db.js

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "payroll_db"
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected ✅");
});

module.exports = db;

```

##Project Structure

```
project/
│── server.js
│
├── config/
│   └── db.js
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
│
├── public/
├── sql/
└── .env
```
---

⚙️ Environment Variables

Create .env file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=payroll_db
PORT=5000


JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

NODE_ENV=development
CORS_ORIGIN=http://localhost:5000


## 🛠️ Setup
Install Dependencies
npm install
Setup Database

Open MySQL Workbench and run:

CREATE DATABASE payroll_db;

Import schema from /sql folder if available.

Run Application
npm run dev

Server URL:
```
http://localhost:5000
```
##🔍 Health Check
```
GET /api/v1/health
```

##📦 NPM Scripts
```
npm run dev      # Start with nodemon
npm start        # Production server
npm run build    # Validate project files
npm run db:init  # Initialize database
```

## 🔗 Main API Groups

**Base URL:** `/api/v1`

### 🔐 Auth
- Register  
- Login  

### 👨‍💼 Employees
- Manage employee records  

### 💰 Payroll
- Salary generation & history  

### 🛠️ Admin
- Reports & system management  

---

## 📊 Business Rules

- ✅ Only admin can modify employee/payroll data  
- 👤 Employees can only view their own records  
- 💰 Salary is calculated based on predefined structure  
- 🗄️ Data integrity enforced via MySQL constraints  

---

## 🔐 Default Credentials 

- **Email:** admin@company.com  
- **Password:** admin123

- **Employee** employee@company.com
- **Password:** emp123  

---

## 🧪 Testing

Use **Postman** or any API testing tool.

### 🔄 Recommended Flow
1. Health Check  
2. Register / Login  
3. Add Employee  
4. Generate Payroll  
5. Fetch Payroll Records  

---

## 📌 Future Enhancements

- 📊 Advanced analytics dashboard  
- 📄 PDF payslip generation  
- ☁️ Cloud deployment  
- 📱 Mobile responsive UI  

---

## 📝 Notes

- Backend follows REST API architecture  
- MySQL ensures reliable relational data storage  
- Authentication secured using JWT & bcrypt  

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
