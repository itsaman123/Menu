# ScanIt — QR Menu & Restaurant SaaS

Multi-tenant platform where restaurants publish a QR menu, take OTP-verified orders, and run operations (orders, billing, inventory, staff) from one admin dashboard. Each restaurant's data is isolated by `restaurantId`, and modules (orders, billing, inventory…) are enabled per restaurant by the Super Admin.

## Tech Stack

| Layer    | Stack |
|----------|-------|
| Frontend | React 19, Vite, MUI 7, React Router 7, TanStack Query, Axios |
| Backend  | Node.js, Express 5, MongoDB + Mongoose, JWT, Helmet, rate limiting |
| Services | Cloudinary (images), apitxt.com (OTP SMS), Resend (emails) |

## Roles

| Role        | Entry point        | Can do |
|-------------|--------------------|--------|
| Super Admin | `/superadmin-login` | Onboard restaurants, manage admins & enabled modules, view platform stats, inquiries |
| Admin (restaurant) | `/login` | Menu, QR codes, live orders, billing, inventory, employees & attendance |
| Customer    | Scan table QR → `/menu/:slug` | Browse, order with OTP, track order, view past orders |

---

## User Flows

### 1. Restaurant onboarding

Self-registration is disabled; restaurants are created by the Super Admin.

```mermaid
flowchart LR
    SA[Super Admin logs in] --> CR[Create restaurant + admin]
    CR --> MOD[Enable modules<br/>orders · billing · inventory…]
    MOD --> MAIL[Send credentials by email]
    MAIL --> AL[Admin logs in at /login]
    AL --> MENU[Add categories & menu items<br/>images → Cloudinary]
    MENU --> QR[Generate & print table QR codes]
    QR --> LIVE([Restaurant is live])
```

### 2. Customer ordering

```mermaid
flowchart TD
    A[Scan table QR] --> B["Menu page /menu/:slug"]
    B --> C[Browse categories, add to cart]
    C --> D["Checkout /checkout/:slug"]
    D --> E[Enter phone number]
    E --> F[Receive 6-digit OTP by SMS]
    F --> G{OTP valid?}
    G -- No --> E
    G -- Yes --> H[Order placed]
    H --> I["Tracking page /order-success/:id<br/>auto-refresh every 5s"]
    I --> J["Past orders /my-orders"]
```

### 3. Order lifecycle (Admin)

```mermaid
stateDiagram-v2
    [*] --> pending: Customer places order
    pending --> confirmed: Admin accepts
    confirmed --> preparing: Kitchen starts
    preparing --> completed: Served
    pending --> cancelled
    confirmed --> cancelled
    completed --> Invoiced: Admin creates invoice (Billing)
    completed --> [*]
    cancelled --> [*]
```

### 4. End-to-end request sequence

```mermaid
sequenceDiagram
    actor Customer
    participant App as Frontend
    participant API as Backend
    participant SMS as apitxt SMS
    actor Admin

    Customer->>App: Scan QR
    App->>API: GET /public/menu/:slug
    API-->>App: Restaurant + menu
    Customer->>App: Cart → checkout, enter phone
    App->>API: POST /api/otp/send
    API->>SMS: Send OTP
    SMS-->>Customer: SMS with OTP
    Customer->>App: Enter OTP
    App->>API: POST /api/otp/verify
    API-->>App: orderToken (customer JWT)
    App->>API: POST /api/orders/create
    API-->>App: Order (status: pending)
    loop Every 30s
        Admin->>API: GET /api/orders/restaurant
    end
    Admin->>API: PUT /api/orders/:id/status
    loop Every 5s until completed/cancelled
        App->>API: GET /api/orders/:id
    end
    Admin->>API: POST /api/billing/invoices
```

---

## Architecture

### Frontend

```mermaid
flowchart LR
    subgraph Public
        L[Landing · Features · Pricing · About · Contact]
        D["/demo"]
    end
    subgraph Customer
        M["/menu/:slug"] --> C["/checkout/:slug"] --> S["/order-success/:id"]
        MO["/my-orders"]
    end
    subgraph Admin["/admin/*"]
        AD[Dashboard] --> LO[Live Orders]
        AD --> MM[Menu]
        AD --> QR[QR Generator]
        AD --> BI[Billing & Invoices]
        AD --> INV[Inventory]
        AD --> EMP[Employees & Attendance]
    end
    SA["/superadmin/*"]

    L --> LG["/login"] --> AD
    Public & Customer & Admin & SA -->|Axios + React Query| API[(REST API)]
```

### Backend

```mermaid
flowchart LR
    FE[React Client] --> SEC[CORS · Helmet · Rate limit]
    SEC --> P["Public<br/>/auth/login · /public/menu/:slug<br/>/api/otp · POST /api/contact"]
    SEC --> AUTH{JWT middleware}
    AUTH -->|customer orderToken| O["/api/orders/create · /:id · /my-orders"]
    AUTH -->|admin + module check| A["/api/categories · menu-items · upload<br/>/api/orders/restaurant · billing<br/>/api/inventory/* · employees · attendance"]
    AUTH -->|super admin| SUP["/api/superadmin/*"]

    P & O & A & SUP --> DB[(MongoDB)]
    A --> CL[Cloudinary]
    P --> SMS[apitxt SMS]
    SUP --> RS[Resend email]
```

---

## Getting Started

**Prerequisites:** Node.js 18+, a MongoDB database (local or Atlas), and Cloudinary / apitxt / Resend accounts.

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/scanit
JWT_SECRET=change-me
CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

API_TXT_API_KEY=            # OTP SMS
RESEND_API_KEY=             # emails
RESEND_FROM_EMAIL=
INQUIRY_TO_EMAIL=           # where contact-form inquiries go

SA_EMAIL=admin@example.com  # Super Admin created by the seed script
SA_PASSWORD=change-me
```

Create the Super Admin, then start the API:

```bash
npm run seed        # add -- --reset to overwrite the password
npm start           # http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
```

Create `client/.env`:

> **API URL:** the base URL is set in `client/src/environment.js`. It currently points to production (`https://api-scanit.nestsphere.in`). To use your local backend, switch it to the commented `VITE_API_URL` / `localhost:5000` line.

```env
VITE_API_URL=http://localhost:5000
# Firebase / analytics
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

```bash
npm run dev         # http://localhost:5173
npm run build       # production build → client/dist
```

### 3. First run

1. Open `http://localhost:5173/superadmin-login` and log in with `SA_EMAIL` / `SA_PASSWORD`.
2. Create a restaurant and its admin, and enable the modules it needs.
3. Log in at `/login` as that admin, add a menu, and generate QR codes.
4. Open `/menu/<restaurant-slug>` (or scan the QR) to place a test order.

## Project Structure

```text
client/src/
  pages/        Public, customer, admin, super-admin screens
  components/   Shared UI
server/
  routes/       REST endpoints (auth, orders, billing, inventory…)
  models/       Mongoose schemas
  middleware/   Admin / super-admin / customer JWT guards
  config/       Cloudinary, SMS provider
  seed.js       Super Admin bootstrap
```
