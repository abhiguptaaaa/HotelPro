# 🏨 HotelPro — Enterprise Hotel Booking & Management Solution

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Node.js Version](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **HotelPro** is a modern, production-grade **Hotel Booking and Management Platform** built on the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**. Designed to streamline end-to-end hospitality operations, it features **Multi-Role RBAC (Guest, Hotel Staff, and Admin)**, real-time room availability tracking, automated reservation invoices, housekeeping workflows, and interactive financial analytics.

---

## 🌟 Resume Highlights (For Placements & Interviews)
Add this to your resume under **Projects / Full-Stack Experience**:
> **HotelPro – Full-Stack Hotel Management & Reservation System (MERN Stack)**
> * Engineered an enterprise hospitality web application supporting **3 distinct role-based workflows** (Guest, Front Desk Staff, Executive Admin) with **JWT authentication and bcrypt password hashing**.
> * Implemented real-time room collision detection algorithms preventing double-booking and dynamic price calculations including GST breakdown and seasonal discounts.
> * Built a staff operations portal managing digital guest **check-ins, RFID keycard issuance, housekeeping status boards, and automated invoice PDF generation**.
> * Developed an executive dashboard utilizing **Recharts** to visualize monthly revenue trends, occupancy rate distributions, and security audit trails.

---

## 📋 Course Requirements Alignment (6 Epics & 19 Tasks)

| Epic # | Epic Name | Scope & Implemented Tasks |
| :--- | :--- | :--- |
| **Epic 1** | **Authentication & Security** | User registration, JWT login, BCrypt password hashing, session recovery, Role-Based Access Control (RBAC) middleware for Guest, Staff, and Admin. |
| **Epic 2** | **Hotel & Inventory Management** | Room Category schemas (Deluxe, Suite, etc.), Room inventory CRUD, multi-image gallery support, floor allocation, and amenity tagging. |
| **Epic 3** | **Guest Reservation Workflow** | Room filtering (price range, capacity, category), date-range collision detection engine, booking confirmation, cancellation, and refund calculations. |
| **Epic 4** | **Payment & Invoicing** | Simulated payment gateway integration, transaction ID tracking, and automated downloadable/printable tax invoices with GST calculations. |
| **Epic 5** | **Hotel Operations & Staff Desk** | Front desk digital check-in (keycard & ID proof validation), check-out room condition inspection, live housekeeping room status board, and guest service request dispatch. |
| **Epic 6** | **Analytics, Reviews & Admin Control** | Business KPIs (Total Revenue, Occupancy Rate), Recharts financial trend charts, star review system with staff replies, notifications, and security audit logs. |

---

## 🚀 Pre-Configured Demo Credentials

Use these instant credentials to evaluate all three roles:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| 👑 **Executive Admin** | `admin@hotelpro.com` | `admin123` | Financial Analytics, Room Inventory CRUD, User Role Management, Audit Logs |
| 💼 **Front Desk Staff** | `staff@hotelpro.com` | `staff123` | Check-In Desk, Keycard Issuance, Check-Out, Housekeeping Board, Service Requests |
| 🧳 **Verified Guest** | `guest@hotelpro.com` | `guest123` | Room Search, Booking & Payment, Invoice Printing, Room Service Requests, Reviews |

> 💡 *Tip: The Login page also features 1-click demo buttons that pre-fill credentials instantly!*

---

## 🛠️ Complete Setup Guide (Beginner Friendly)

### Prerequisites
- **Node.js** (v16 or above installed): Check by running `node -v` in terminal.
- **MongoDB**: You can use either **MongoDB Atlas (Free Cloud)** or **Local MongoDB**.

---

### Step 1: Configure MongoDB Database

#### Option A: MongoDB Atlas (Recommended — Free & No Installation Needed)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Build a **Free M0 Cluster**.
3. Under **Database Access**, create a user (e.g. `admin` and a strong password).
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers** -> Copy your connection string (e.g. `mongodb+srv://admin:<password>@cluster0.mongodb.net/hotelpro?retryWrites=true&w=majority`).
6. Paste this URI inside `backend/.env` as `MONGO_URI`.

#### Option B: Local MongoDB
If you have MongoDB Community Server installed locally, keep the default URI:
```env
MONGO_URI=mongodb://127.0.0.1:27017/hotelpro
```

---

### Step 2: Seed Sample Data
Populate rooms, categories, demo users, bookings, payments, and reviews with one command:
```bash
npm run seed
```
*(Or navigate to `cd backend` and run `npm run seed`)*

---

### Step 3: Run the Application

Open two terminal windows:

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm run dev
```
*Backend runs at: `http://localhost:5000`*

#### Terminal 2 — Start Frontend Client:
```bash
cd frontend
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

Open your browser and navigate to **`http://localhost:5173`**!

---

## 🔌 Core REST API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new Guest or Staff account
- `POST /api/auth/login` — Authenticate and receive JWT Bearer token
- `GET /api/auth/profile` — Get logged-in user profile (Protected)
- `PUT /api/auth/profile` — Update user profile details (Protected)
- `GET /api/auth/users` — List all registered users (Admin only)
- `PUT /api/auth/users/:id/role` — Update user permissions (Admin only)

### 🛏️ Rooms & Inventory (`/api/rooms`)
- `GET /api/rooms` — Search and filter rooms (category, price, capacity, status)
- `GET /api/rooms/:id` — Get single room details
- `POST /api/rooms/:id/availability` — Validate room availability for date range
- `POST /api/rooms` — Create new room (Admin/Staff)
- `PUT /api/rooms/:id` — Update room pricing/info (Admin/Staff)
- `DELETE /api/rooms/:id` — Delete room (Admin only)

### 📅 Bookings & Reservations (`/api/bookings`)
- `POST /api/bookings` — Create a room booking with collision checks (Guest)
- `GET /api/bookings/my` — Get logged-in user's booking history (Guest)
- `GET /api/bookings/:id` — Get single booking details
- `PUT /api/bookings/:id/cancel` — Cancel reservation & process refund (Guest/Admin)
- `GET /api/bookings` — Get all bookings across hotel (Staff/Admin)

### 💳 Payments & Invoices (`/api/payments`)
- `POST /api/payments/process` — Process online payment transaction
- `GET /api/payments/invoice/:bookingId` — Get printable invoice & breakdown

### 🛎️ Hotel Operations & Housekeeping (`/api/operations`)
- `POST /api/operations/check-in` — Check-in guest, issue keycard & record ID proof (Staff)
- `POST /api/operations/check-out` — Check-out guest, inspect room, trigger cleaning (Staff)
- `PUT /api/operations/room/:roomId/status` — Update housekeeping status (Staff)
- `GET /api/operations/overview` — Get arrivals, departures, and occupancy metrics (Staff)

### 🛎️ Guest Services (`/api/services`)
- `POST /api/services` — Request room dining, housekeeping, maintenance (Guest)
- `GET /api/services/my` — View guest service history (Guest)
- `GET /api/services` — Service dispatch queue (Staff/Admin)
- `PUT /api/services/:id` — Update request status (Staff/Admin)

### ⭐ Ratings & Reviews (`/api/reviews`)
- `POST /api/reviews` — Submit room rating and comment (Guest)
- `GET /api/reviews/room/:roomId` — Get reviews for a room (Public)
- `POST /api/reviews/:id/respond` — Staff reply to customer review (Staff/Admin)

### 📊 Admin Analytics & Logs (`/api/admin`)
- `GET /api/admin/analytics` — Revenue, Occupancy, Trend KPIs (Admin)
- `GET /api/admin/logs` — Security audit trail (Admin)

---

## 📦 Project Architecture
```
HotelManagement/
├── backend/
│   ├── config/          # MongoDB connection configuration
│   ├── controllers/     # Express route handlers & business logic
│   ├── middleware/      # JWT auth, RBAC, error handler, Multer
│   ├── models/          # 11 Mongoose Schemas (User, Room, Booking, Payment, etc.)
│   ├── routes/          # REST API endpoints
│   ├── utils/           # Database seeder script & mock data
│   ├── server.js        # Entry point for backend API
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Footer, ProtectedRoute, Modals (Invoice, Review, Service)
│   │   ├── context/     # AuthContext (JWT management & global session)
│   │   ├── pages/       # Home, RoomList, RoomDetails, Login, Register, Dashboards
│   │   ├── services/    # Axios instance with interceptors
│   │   ├── App.jsx      # React Router configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── package.json
```


