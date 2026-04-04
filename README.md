# CulinaryCanvas — QR Menu & Ordering SaaS Platform

A production-ready, multi-tenant SaaS platform that enables restaurants to create digital QR menus, accept contactless orders, and manage operations through a real-time admin dashboard.

---

## 🎯 Overview

CulinaryCanvas allows restaurant owners to:
- **Register** their restaurant and build a digital menu
- **Generate QR codes** that link customers directly to the menu
- **Accept orders** via OTP-verified mobile checkout
- **Track orders** in real-time with status updates
- **Manage everything** from a sidebar-driven admin dashboard

Customers can:
- **Scan a QR code** → view the menu → add items to cart → checkout with OTP → track their order live

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| MUI (Material UI) | 7.x | Component library |
| TanStack React Query | 5.x | Data fetching & caching |
| React Router | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| qrcode.react | 4.x | QR code generation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.x | HTTP framework |
| MongoDB + Mongoose | 9.x | Database & ODM |
| JWT (jsonwebtoken) | 9.x | Authentication |
| bcryptjs | 3.x | Password hashing |
| Cloudinary + Multer | — | Image upload & storage |

### Design System
| Token | Value |
|-------|-------|
| Primary Color | `#5341cd` → `#6C5CE7` (gradient) |
| Headline Font | Manrope (800 weight) |
| Body Font | Inter (400–600 weight) |
| Border Strategy | No 1px borders — tonal surface nesting only |
| Shadow System | Ambient: `0px 20px 50px rgba(25,28,30,0.06)` |

---

## 📁 Project Structure

```
QR-Menu/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── api.js              # Axios instance with auth interceptors
│   │   ├── demoData.js         # Static demo menu for pitching
│   │   ├── main.jsx            # MUI theme + providers
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # CulinaryCanvas design tokens
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── hooks/
│   │   │   └── useCart.js      # Cart state (localStorage)
│   │   └── pages/
│   │       ├── LandingPage.jsx    # Marketing / pricing
│   │       ├── Login.jsx          # Admin login
│   │       ├── Register.jsx       # Admin + restaurant registration
│   │       ├── PublicMenu.jsx     # Customer-facing menu
│   │       ├── Checkout.jsx       # Cart + OTP checkout
│   │       ├── OrderSuccess.jsx   # Order tracking + timer
│   │       └── AdminDashboard.jsx # Full admin panel
│   └── package.json
│
├── server/                     # Node.js Backend (Express)
│   ├── server.js               # App entry point
│   ├── .env                    # Environment variables
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary + Multer config
│   ├── middleware/
│   │   ├── authMiddleware.js   # Admin JWT + X-Restaurant-Id validation
│   │   └── customerAuth.js     # Customer OTP token validation
│   ├── models/
│   │   ├── Admin.js            # Admin user model
│   │   ├── Restaurant.js       # Restaurant model
│   │   ├── Category.js         # Menu category model
│   │   ├── MenuItem.js         # Menu item model
│   │   ├── Order.js            # Order model
│   │   └── Otp.js              # OTP model (5min TTL)
│   ├── routes/
│   │   ├── auth.js             # Register + Login
│   │   ├── category.js         # CRUD categories
│   │   ├── menuItem.js         # CRUD menu items
│   │   ├── order.js            # Order create + manage
│   │   ├── otp.js              # Send + Verify OTP
│   │   ├── public.js           # Public menu endpoint
│   │   └── upload.js           # Image upload
│   └── package.json
│
└── docs/                       # Documentation
    ├── API.md                  # Full API reference
    ├── FRONTEND.md             # Frontend architecture
    └── USER_FLOWS.md           # User flow diagrams
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Clone & Install

```bash
git clone <repo-url>
cd QR-Menu

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qr-menu
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server
node server.js

# Terminal 2 — Frontend
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/API.md) | All backend routes, request/response formats |
| [Frontend Architecture](docs/FRONTEND.md) | Pages, components, state management, design system |
| [User Flows](docs/USER_FLOWS.md) | End-to-end user journey diagrams |

---

## 🔒 Multi-Tenant Security

Every admin API call is scoped by **two security layers**:

1. **JWT Token** — embeds `adminId` + `restaurantId`
2. **X-Restaurant-Id Header** — frontend sends, backend validates against DB

This ensures Restaurant A's admin can **never** access Restaurant B's data.

---

## 🇮🇳 Localization

- Currency: Indian Rupee (₹)
- Tax label: GST (5%)
- Demo menu items: Indian cuisine (Harvest Grain Bowl, Wild Mushroom Pizza, etc.)

---

## 📄 License

Private — All rights reserved.
