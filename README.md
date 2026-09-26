# ✂️ Salon Management System (Full-Stack MongoDB SaaS Application)

A university-grade, full-stack **Salon Management SaaS Application** built using **Node.js, Express.js, MongoDB, Mongoose ODM, React (Vite), and Tailwind CSS**.

> [!IMPORTANT]
> **Database Architecture**: This system exclusively uses **MongoDB** and **Mongoose ODM**. No SQL or MySQL dependencies are used anywhere in this repository.

---

## 🚀 Quick Start Guide (How to Run This Code)

### Prerequisites
1. **Node.js** (v18 or higher installed): Check with `node -v`
2. **MongoDB Database** (Local MongoDB Community Server running at `mongodb://127.0.0.1:27017` OR a free **MongoDB Atlas** cluster URI).

---

### Step 1: Start MongoDB Service
Ensure your local MongoDB service is running, or get your MongoDB Atlas Connection String.
- **Local Default Connection**: `mongodb://127.0.0.1:27017/salon_management`

---

### Step 2: Backend Setup & Database Seeding

Open your terminal or command prompt:

```bash
# 1. Navigate to the backend folder
cd Backend

# 2. Install dependencies (if not already installed)
npm install

# 3. Seed demo accounts & sample database records into MongoDB
npm run seed

# 4. Start the backend server
npm run dev
```

Expected Output:
```
MongoDB Connected: 127.0.0.1/salon_management
==================================================
 Salon Management Backend Server running on port 5000
 Environment: development
 Swagger Docs: http://localhost:5000/api-docs
==================================================
```

---

### Step 3: Frontend Setup & Web Portal Launch

Open a second terminal window:

```bash
# 1. Navigate to the frontend folder
cd Frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Launch the Vite development server
npm run dev
```

Expected Output:
```
  VITE v6.2.0  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔑 Demo Credentials

Use these pre-configured accounts to sign in at `http://localhost:5173/login`:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@salon.com` | `Admin@123` | Full Access (Barbers, Services, Customers, Appointments, Wages, Reports, Analytics) |
| **Receptionist** | `receptionist@salon.com` | `Recept@123` | Manage Customers, Schedule Appointments, Check Attendance |
| **Barber** | `john@salon.com` | `Barber@123` | Mark Personal Attendance, View Personal Schedule & Wages |
| **Barber 2** | `alex@salon.com` | `Barber@123` | Stylist Profile |
| **Barber 3** | `maria@salon.com` | `Barber@123` | Stylist Profile |

---

## 📚 Interactive Swagger API Documentation

Once the backend server is running on port `5000`, open your web browser to:

👉 **`http://localhost:5000/api-docs`**

You can test all endpoints, authenticate via JWT Bearer Token, and view JSON response schemas directly from the Swagger UI.

---

## 🌟 Core Features & Technical Highlights

### 1. MongoDB Collections & Mongoose Schemas
- **`users`**: Email unique index, hashed password using `bcryptjs` (hidden by default).
- **`customers`**: Name, phone, email, gender with compound indexing.
- **`services`**: Service title, duration (minutes), price, description.
- **`barbers`**: Ref `User`, specialization, commission percentage (0-100%), joining date, active status.
- **`appointments`**: Ref `Customer`, `Barber`, `Service`, date, start time, auto-calculated end time, status, remarks.
- **`attendance`**: Ref `Barber`, check-in/check-out timestamps, daily attendance dates.
- **`wageRecords`**: Ref `Barber`, payroll month (`YYYY-MM`), base salary, calculated commission, total payout.

### 2. Advanced Slot Scheduling Engine & Overlap Prevention
- **Double Booking Prevention**: Rejects overlapping bookings for the same barber on the same date:
  ```
  existing.startTime < newEndTime AND existing.endTime > newStartTime
  ```
  Returns `409 Conflict` with `"error": "APPOINTMENT_CONFLICT"`.
- **Automatic End-Time Calculation**: Automatically calculates `endTime` from `startTime + service.duration`.
- **Shift & Holiday Rules**: Prevents bookings outside 09:00 - 19:00 shift hours and on configured holiday dates.

### 3. Automated Payroll & Commission Engine
- **Formula**: `commission = (service.price * barber.commissionPercentage) / 100` for all `Completed` appointments in that month.
- **Total Payout**: `totalAmount = baseSalary + commission`.

### 4. Native MongoDB Aggregation Pipelines
- **Daily & Monthly Revenue**: Grouping completed appointments and calculating earnings.
- **Top Performing Services**: Ranking services by booking volume and total revenue.
- **Barber Performance**: Aggregating stylist revenue generation and earned commissions.
- **Customer Retention Analysis**: Grouping visit frequency and total customer spend.

---

## 📂 Project Structure

```
Salon-Management-System/
├── Backend/
│   ├── src/
│   │   ├── config/ (db.js)
│   │   ├── controllers/ (auth, customer, service, barber, appointment, attendance, wage, report, dashboard)
│   │   ├── docs/ (swagger.js)
│   │   ├── middlewares/ (auth, role, validate, error)
│   │   ├── models/ (User, Customer, Service, Barber, Appointment, Attendance, WageRecord, Holiday)
│   │   ├── routes/ (auth, customer, service, barber, appointment, attendance, wage, report, dashboard)
│   │   ├── utils/ (seed.js, responseHandler.js, timeUtils.js)
│   │   ├── validations/ (Joi schemas)
│   │   └── app.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── hooks/ (useAuth.js)
│   │   ├── layouts/ (MainLayout.jsx)
│   │   ├── pages/ (Login, Dashboard, Customers, Services, Barbers, Appointments, Attendance, Wages, Reports, Profile)
│   │   ├── routes/ (AppRoutes.jsx, ProtectedRoute.jsx)
│   │   ├── services/ (Axios API modules)
│   │   └── utils/ (formatters.js)
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── postman/
│   └── Salon-Management-System.postman_collection.json
└── README.md
```

---

## 🌐 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/salon_management
JWT_SECRET=salon_jwt_secret_key_super_secure_2026
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Postman API Testing
Import the Postman collection located at `postman/Salon-Management-System.postman_collection.json` into Postman to test pre-configured API requests.
