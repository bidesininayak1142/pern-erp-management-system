# PERN ERP Management System

A full-stack **ERP (Enterprise Resource Planning) Management System** developed using the **PERN Stack — PostgreSQL, Express.js, React.js, and Node.js**.

The system helps manage business operations such as customers, enquiries, quotations, sales orders, and dispatches through a centralized web application.

## 🚀 Features

* 🔐 User Login and Authentication
* 👥 Customer Management
* 📩 Enquiry Management
* 📄 Quotation Management
* 🛒 Sales Order Management
* 🚚 Dispatch Management
* 📊 ERP Dashboard
* 🔄 REST API Integration
* 🗄️ PostgreSQL Database
* ⚡ React.js Frontend
* 🖥️ Node.js and Express.js Backend

## 🛠️ Technologies Used

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* React Router
* Lucide React

### Backend

* Node.js
* Express.js
* REST APIs
* CORS
* JWT Authentication
* bcrypt

### Database

* PostgreSQL
* pgAdmin

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman

## 📁 Project Structure

```text
Pern Project/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
├── package.json
├── start-dev.js
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bidesininayak1142/pern-erp-management-system.git
```

### 2. Go to the Project Folder

```bash
cd pern-erp-management-system
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=5432
JWT_SECRET=your_secret_key
```

**Do not upload your `.env` file to GitHub.**

## 🗄️ Database Setup

1. Install PostgreSQL.
2. Open PostgreSQL/pgAdmin.
3. Create a database for the ERP system.
4. Update the database details in the backend `.env` file.
5. Run the required SQL tables/scripts.

## ▶️ Running the Application

### Start Backend

```bash
cd backend
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on a local Vite URL, usually:

```text
http://localhost:5173
```

## 🔄 Application Flow

```text
React Frontend
      ↓
Axios / REST API
      ↓
Express.js Backend
      ↓
PostgreSQL Database
```

## 📌 Main Modules

### Customer Management

Manage customer information including adding, viewing, updating, and deleting customers.

### Enquiry Management

Create and manage customer enquiries.

### Quotation Management

Create quotations based on customer enquiries and manage quotation status.

### Sales Order Management

Manage sales orders generated from quotations.

### Dispatch Management

Track and manage the dispatch process for sales orders.

## 🎯 Project Objective

The main objective of this project is to develop a centralized ERP system that simplifies business operations and provides an organized way to manage customers, enquiries, quotations, sales orders, and dispatch activities.

## 👩‍💻 Developer

**Bidesini Nayak**

B.Tech Computer Science & Engineering

Nalanda Institute of Technology, Bhubaneswar

## 📄 License

This project is developed for educational and project purposes.
