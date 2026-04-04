# API Reference — CulinaryCanvas Backend

Base URL: `http://localhost:5000`

---

## Table of Contents

- [Authentication](#authentication)
- [Categories](#categories)
- [Menu Items](#menu-items)
- [Orders](#orders)
- [OTP](#otp)
- [Public Menu](#public-menu)
- [Upload](#upload)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Error Handling](#error-handling)

---

## Authentication

All admin endpoints require the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
X-Restaurant-Id: <RESTAURANT_MONGO_ID>
```

The JWT token is returned on login/register and contains:
```json
{
  "id": "admin_mongo_id",
  "restaurantId": "restaurant_mongo_id",
  "iat": 1234567890,
  "exp": 1237159890
}
```

---

## Auth Routes

### `POST /auth/register`

Register a new restaurant and admin account.

**Request Body:**
```json
{
  "restaurantName": "The Bistro",
  "slug": "the-bistro",
  "email": "admin@bistro.com",
  "password": "securepass123"
}
```

**Success Response (201):**
```json
{
  "_id": "665a1b2c...",
  "email": "admin@bistro.com",
  "restaurantId": "665a1b2c...",
  "restaurantName": "The Bistro",
  "slug": "the-bistro",
  "token": "eyJhbGciOi..."
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | `Restaurant slug already exists` |
| 400 | `Email already exists` |
| 400 | `All fields are required` |
| 500 | `Server error` |

---

### `POST /auth/login`

Login as restaurant admin.

**Request Body:**
```json
{
  "email": "admin@bistro.com",
  "password": "securepass123"
}
```

**Success Response (200):**
```json
{
  "_id": "665a1b2c...",
  "email": "admin@bistro.com",
  "restaurantId": "665a1b2c...",
  "restaurantName": "The Bistro",
  "slug": "the-bistro",
  "token": "eyJhbGciOi..."
}
```

**Errors:**
| Code | Message |
|------|---------|
| 401 | `Invalid email or password` |

---

## Super Admin

> All endpoints require `SuperAdmin JWT` (`protectSuperAdmin`).

### `POST /api/superadmin/login`

Login as the global Super Admin.
**Request Body:** `{"email": "superadmin@system.com", "password": "..."}`
**Response (200):** Token + Role.

### `GET /api/superadmin/admins`

Get all registered Admins (populates the associated restaurant data).

### `PUT /api/superadmin/admins/:id`

Update an Admin's `isActive` flag (freeze account) or `disabledFeatures` array (lock out specific dashboard tools).
**Request Body (optional fields):**
```json
{
  "isActive": false,
  "disabledFeatures": ["analytics", "qr"]
}
```

### `DELETE /api/superadmin/admins/:id`

Permanently delete an Admin.

---

## Categories

> All endpoints require Admin JWT. Data is scoped by `req.admin.restaurantId`.

### `GET /api/categories`

Get all categories for the logged-in admin's restaurant.

**Response (200):**
```json
[
  {
    "_id": "665a1c3d...",
    "name": "Main Courses",
    "restaurantId": "665a1b2c...",
    "order": 0,
    "createdAt": "2026-04-04T10:00:00Z"
  }
]
```

---

### `POST /api/categories`

Create a new category.

**Request Body:**
```json
{
  "name": "Desserts",
  "order": 2
}
```

**Response (201):** The created category object.

---

### `PUT /api/categories/:id`

Update a category. Only updates if it belongs to the admin's restaurant.

**Request Body:**
```json
{
  "name": "Sweet Endings",
  "order": 3
}
```

**Response (200):** The updated category object.

**Errors:**
| Code | Message |
|------|---------|
| 404 | `Category not found` |

---

### `DELETE /api/categories/:id`

Delete a category. Only deletes if it belongs to the admin's restaurant.

**Response (200):**
```json
{ "message": "Category removed" }
```

---

## Menu Items

> All endpoints require Admin JWT. Data is scoped by `req.admin.restaurantId`.

### `GET /api/menu-items`

Get all menu items for the admin's restaurant.

**Response (200):**
```json
[
  {
    "_id": "665a1d4e...",
    "name": "Paneer Tikka",
    "description": "Cottage cheese marinated in spices",
    "price": 249,
    "image": "https://res.cloudinary.com/...",
    "categoryId": "665a1c3d...",
    "restaurantId": "665a1b2c...",
    "isAvailable": true
  }
]
```

---

### `POST /api/menu-items`

Create a new menu item.

**Request Body:**
```json
{
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry with tender chicken",
  "price": 350,
  "image": "https://res.cloudinary.com/...",
  "categoryId": "665a1c3d...",
  "isAvailable": true
}
```

**Response (201):** The created item object (restaurantId is auto-set from JWT).

---

### `PUT /api/menu-items/:id`

Update a menu item. Only if it belongs to admin's restaurant.

**Request Body:** Same fields as POST (all optional).

---

### `DELETE /api/menu-items/:id`

Delete a menu item. Only if it belongs to admin's restaurant.

---

## Orders

### `POST /api/orders/create`

Create a new order after OTP verification.

**Auth:** Customer OTP token (`Bearer <orderToken>`)

**Request Body:**
```json
{
  "restaurantSlug": "the-bistro",
  "tableNumber": "12",
  "items": [
    { "menuItemId": "665a1d4e...", "name": "Paneer Tikka", "quantity": 2 },
    { "menuItemId": "665a1d5f...", "name": "Butter Naan", "quantity": 4 }
  ]
}
```

> **Note:** Prices are verified server-side from the database. Frontend prices are ignored.

**Response (201):**
```json
{
  "_id": "665a1e5f...",
  "restaurantId": "665a1b2c...",
  "items": [
    { "menuItemId": "665a1d4e...", "name": "Paneer Tikka", "price": 249, "quantity": 2 },
    { "menuItemId": "665a1d5f...", "name": "Butter Naan", "price": 60, "quantity": 4 }
  ],
  "totalAmount": 780.15,
  "tableNumber": "12",
  "status": "pending",
  "customerPhone": "9876543210",
  "createdAt": "2026-04-04T10:15:00Z"
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | `Restaurant slug and items are required` |
| 400 | `Invalid item: <name>` |
| 400 | `Item out of stock: <name>` |
| 404 | `Restaurant not found` |

---

### `GET /api/orders/restaurant`

Get all orders for the admin's restaurant. **Polled every 10 seconds** by the dashboard.

**Auth:** Admin JWT

**Response (200):** Array of order objects, sorted newest first.

---

### `PUT /api/orders/:id/status`

Update order status. Only for orders belonging to admin's restaurant.

**Auth:** Admin JWT

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid statuses:** `pending` → `confirmed` → `preparing` → `completed` | `cancelled`

---

### `GET /api/orders/:id`

Get a single order's details (for customer tracking page).

**Auth:** None (order ID serves as access token)

**Response (200):**
```json
{
  "_id": "665a1e5f...",
  "restaurantId": {
    "_id": "665a1b2c...",
    "name": "The Bistro",
    "slug": "the-bistro"
  },
  "items": [...],
  "totalAmount": 780.15,
  "status": "preparing",
  "customerPhone": "9876543210",
  "createdAt": "2026-04-04T10:15:00Z"
}
```

---

### `GET /api/orders/my-orders`

Get all orders for the OTP-verified customer.

**Auth:** Customer OTP token

---

## OTP

### `POST /api/otp/send-otp`

Send a 4-digit OTP to a phone number.

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully"
}
```

> **Note:** OTP is delivered via native SMS using **AWS SNS**. If AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are omitted from `.env`, it safely falls back to logging the OTP to the backend console.
> **Security Guard:** Strict rate limit of **3 OTP requests per 5 minutes per IP** to prevent SMS toll fraud.

---

### `POST /api/otp/verify-otp`

Verify OTP and receive a 15-minute order token.

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "1234"
}
```

**Response (200):**
```json
{
  "message": "OTP verified successfully",
  "orderToken": "eyJhbGci..."
}
```

**Errors:**
| Code | Message |
|------|---------|
| 401 | `Invalid or expired OTP` |

> **Security Guard:** Strict rate limit of **5 verification attempts per 5 minutes per IP** to prevent guess-bruteforcing.

---

## Public Menu

### `GET /public/menu/:slug`

Get the full structured menu for a restaurant (public, no auth).

**Response (200):**
```json
{
  "restaurant": {
    "name": "The Bistro",
    "slug": "the-bistro"
  },
  "menu": [
    {
      "_id": "665a1c3d...",
      "name": "Main Courses",
      "items": [
        {
          "_id": "665a1d4e...",
          "name": "Paneer Tikka",
          "description": "...",
          "price": 249,
          "image": "https://...",
          "isAvailable": true
        }
      ]
    }
  ]
}
```

**Errors:**
| Code | Message |
|------|---------|
| 404 | `Restaurant not found` |
| 403 | `Menu is currently unavailable` (inactive subscription) |

---

## Upload

### `POST /api/upload`

Upload an image to Cloudinary.

**Auth:** Admin JWT

**Content-Type:** `multipart/form-data`

**Form field:** `image` (file)

**Allowed formats:** jpg, png, jpeg, webp

**Response (200):**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/xxx/image/upload/v123/qr_menu_items/abc.jpg",
  "restaurantId": "665a1b2c..."
}
```

---

## Database Models

### Restaurant
```
{
  name:               String (required)
  slug:               String (required, unique)
  subscriptionStatus: String (enum: active|inactive|trial, default: active)
  createdAt:          Date
  updatedAt:          Date
}
```

### Admin
```
{
  email:            String (required, unique)
  password:         String (required, bcrypt hashed)
  restaurantId:     ObjectId → Restaurant (required)
  isActive:         Boolean (default: true)
  disabledFeatures: [String] (List of restricted features, e.g., 'menu', 'analytics')
  createdAt:        Date
  updatedAt:        Date
}
```

### SuperAdmin
```
{
  email:        String (required, unique)
  password:     String (required, bcrypt hashed)
  createdAt:    Date
  updatedAt:    Date
}
```

### Category
```
{
  name:         String (required)
  restaurantId: ObjectId → Restaurant (required)
  order:        Number (default: 0)
  createdAt:    Date
  updatedAt:    Date
}
```

### MenuItem
```
{
  name:         String (required)
  description:  String
  price:        Number (required)
  image:        String (Cloudinary URL)
  categoryId:   ObjectId → Category (required)
  restaurantId: ObjectId → Restaurant (required)
  isAvailable:  Boolean (default: true)
  createdAt:    Date
  updatedAt:    Date
}
```

### Order
```
{
  restaurantId:  ObjectId → Restaurant (required)
  items: [{
    menuItemId:  ObjectId → MenuItem (required)
    name:        String (required)
    price:       Number (required)
    quantity:    Number (required, min: 1)
  }]
  totalAmount:   Number (required, includes 5% GST)
  tableNumber:   String (optional)
  status:        String (enum: pending|confirmed|preparing|completed|cancelled)
  customerPhone: String (required)
  createdAt:     Date
  updatedAt:     Date
}
```

### Otp
```
{
  phone:     String (required)
  otp:       String (required)
  createdAt: Date (auto-expires after 300 seconds / 5 minutes)
}
```

---

## Middleware

### `protect` (authMiddleware.js)
- Extracts JWT from `Authorization: Bearer <token>`
- Looks up Admin by decoded `id`
- Rejects access (403) if `admin.isActive === false`
- Attaches `req.admin` (with `restaurantId`) to request
- Validates `X-Restaurant-Id` header matches the admin's actual `restaurantId`
- Returns 401 if token is missing/invalid, 403 if restaurant ID mismatches

### `protectSuperAdmin` (authMiddleware.js)
- Extracts JWT and finds the global `SuperAdmin` record.
- Grants sweeping access to `/api/superadmin/*` routes.

### `protectCustomer` (customerAuth.js)
- Extracts JWT from `Authorization: Bearer <token>`
- Verifies decoded payload contains `phone`
- Attaches `req.customer = { phone }` to request
- Token is short-lived (15 minutes)

### Standard Security & Rate Limiting (server.js)
- **Helmet**: Sets 15+ HTTP security headers.
- **Express-Mongo-Sanitize**: Prevents NoSQL character injection.
- **HPP**: Protects against HTTP Parameter Pollution.
- **Global API Limiter**: Max 100 requests every 15 minutes per IP.
- **Payload Limiter**: `express.json` is capped at 10KB to prevent memory flood DoS.

---

## Error Handling

All errors follow the format:
```json
{
  "message": "Human-readable error description"
}
```

Standard HTTP codes used:
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (wrong restaurant) |
| 404 | Resource not found |
| 500 | Server error |
