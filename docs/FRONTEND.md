# Frontend Architecture — CulinaryCanvas

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Design System](#design-system)
- [Routing](#routing)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Pages Reference](#pages-reference)
- [Components](#components)
- [Hooks](#hooks)
- [Demo Mode](#demo-mode)

---

## Technology Stack

| Library | Purpose |
|---------|---------|
| **React 19** | Component framework |
| **Vite 8** | Dev server + bundler |
| **MUI 7** | Material Design components |
| **React Router 7** | Client routing |
| **TanStack React Query 5** | Server-state management, caching, polling |
| **Axios** | HTTP client with interceptors |
| **qrcode.react** | QR code SVG generation |

---

## Design System

The frontend implements the **CulinaryCanvas** design system (Stitch Project #5643472282066423814).

### Color Palette

| Role | CSS Variable | Value | Usage |
|------|-------------|-------|-------|
| Primary | `--cc-primary` | `#5341cd` | Active states, links |
| Primary Container | `--cc-primary-container` | `#6C5CE7` | Gradient endpoints |
| Background | `--cc-background` | `#f7f9fb` | Global background |
| Surface Lowest | `--cc-surface-container-lowest` | `#ffffff` | Cards, form containers |
| Surface Low | `--cc-surface-container-low` | `#f2f4f6` | Section backgrounds, input fills |
| On-Surface | `--cc-on-surface` | `#191c1e` | Primary text |
| On-Surface Variant | `--cc-on-surface-variant` | `#474554` | Secondary text |
| Outline Variant | `--cc-outline-variant` | `#c8c4d7` | Ghost borders (15% opacity) |

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Headlines (h1–h6) | **Manrope** | 700–800 | Page titles, section headers |
| Body / Labels | **Inter** | 400–600 | Text, buttons, form labels |

Fonts are loaded from Google Fonts in `index.css`.

### Core Design Rules

1. **No-Line Rule** — No 1px solid borders. Boundaries are defined through background color shifts (tonal nesting)
2. **Glassmorphism** — Floating elements use `backdrop-filter: blur(40px)` with 80% opacity backgrounds
3. **Ambient Shadows** — `0px 20px 50px rgba(25,28,30,0.06)` — tinted, never pure black
4. **Ghost Borders** — When required: `outline-variant` at 15% opacity
5. **Gradient CTAs** — Primary buttons use `linear-gradient(135deg, #5341cd, #6C5CE7)` with a purple glow shadow

### MUI Theme Overrides (main.jsx)

```javascript
palette: {
  primary: { main: '#5341cd', light: '#6C5CE7', dark: '#4029ba' },
  background: { default: '#f7f9fb', paper: '#ffffff' },
  text: { primary: '#191c1e', secondary: '#474554' }
}
```

All Button, Card, Paper, TextField, Chip, Tab, Fab, and AppBar components have custom style overrides.

---

## Routing

Defined in `App.jsx`:

| Path | Page | Auth | Description |
|------|------|------|-------------|
| `/` | `LandingPage` | Public | Marketing page with pricing |
| `/login` | `Login` | Public | Admin login |
| `/register` | `Register` | Public | Restaurant + admin registration |
| `/menu/:slug` | `PublicMenu` | Public | Customer-facing restaurant menu |
| `/checkout/:slug` | `Checkout` | Public | Cart review + OTP verification |
| `/order-success/:id` | `OrderSuccess` | Public | Order tracking + countdown timer |
| `/admin/*` | `AdminDashboard` | Protected | Full admin panel (sidebar navigation) |

### Route Protection

`ProtectedRoute` component checks for `token` in localStorage. If missing, redirects to `/login`.

---

## State Management

### Server State — React Query

All API data fetching uses TanStack React Query with `restaurantId` in query keys for multi-tenant cache isolation:

```javascript
queryKey: ['categories', user?.restaurantId]
queryKey: ['menuItems', user?.restaurantId]
queryKey: ['adminOrders', user?.restaurantId]  // refetchInterval: 10000ms
```

### Client State — localStorage

| Key | Data | Persistence |
|-----|------|-------------|
| `token` | JWT auth token | Until logout |
| `user` | `{ _id, email, restaurantId, restaurantName, slug, token }` | Until logout |
| `cart` | `[{ menuItemId, name, price, quantity, image }]` | Until cleared/checkout |
| `customerToken` | OTP-verified short-lived token (15min) | Until order placed |

### Cart Hook — `useCart.js`

Custom hook managing cart state in localStorage:

```javascript
const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
```

- `addToCart(item)` — Adds item or increments quantity
- `removeFromCart(itemId)` — Removes item from cart
- `updateQuantity(itemId, qty)` — Sets specific quantity (removes if < 1)
- `clearCart()` — Empties entire cart
- `cartTotal` — Computed sum of all `price × quantity`
- `cartCount` — Total item count

---

## API Layer

`api.js` creates an Axios instance with interceptors:

```javascript
const api = axios.create({ baseURL: 'http://localhost:5000' });
```

### Request Interceptor

Automatically attaches on every request:
1. `Authorization: Bearer <token>` — from `localStorage.token`
2. `X-Restaurant-Id: <restaurantId>` — from `localStorage.user.restaurantId`

This ensures every admin API call is properly scoped for multi-tenancy.

---

## Pages Reference

### LandingPage (`/`)
- Glassmorphism sticky navbar
- Hero section with CTAs (Start Free Trial, See Live Demo)
- 3 feature cards (QR Menu, Analytics, OTP Login)
- 3 pricing tiers (Starter Free, Professional ₹2,999/mo, Enterprise ₹7,999/mo)
- Testimonial section
- Footer with links

### Login (`/login`)
- Split-screen layout (form left, hero image right)
- Purple gradient overlay on background image
- Floating bubble animation in background
- Links to `/register`

### Register (`/register`)
- Mirror of login with onboarding imagery
- Fields: Restaurant Name, URL Slug, Email, Password
- On success: stores token + user, redirects to `/admin`

### PublicMenu (`/menu/:slug`)
- Purple gradient header with restaurant name
- Glassmorphism category tabs (sticky, scrollable)
- Menu item cards with image, description, price, add-to-cart controls
- Floating bottom dock navigation (Menu, Search, Cart)
- Sticky cart summary bar with gradient background and item count/total
- Supports demo mode when slug is `demo`

### Checkout (`/checkout/:slug`)
- Back arrow navigation
- Order summary with itemized list
- Tonal nested bill breakdown (Subtotal, GST 5%, Grand Total)
- Two-step OTP flow (Stepper)
  - Step 1: Enter phone number → Send OTP
  - Step 2: Enter OTP → Verify & Place Order
- Supports demo bypass (no API calls)

### OrderSuccess (`/order-success/:id`)
- Purple gradient success header with emoji
- Order ID display
- Countdown timer (15 minutes, Manrope font)
- Vertical status timeline (Order Received → Confirmed → Preparing → Ready)
- Polls backend every 5 seconds for status updates
- Order summary with total
- Floating bottom dock navigation

### AdminDashboard (`/admin`)
- **Permanent sidebar** (260px) with navigation:
  - Dashboard, Menu, Orders, Analytics, QR Codes
  - Settings, Support
  - User avatar + logout
- **Dashboard section**: Stat cards (Orders, Revenue, Menu Items), Trending Items
- **Menu section**: Category grid cards + Menu item grid with images, Add/Edit/Delete dialogs
- **Orders section**: Live order cards with status pills, action buttons (Accept/Start Prep/Ready/Cancel)
- **Analytics section**: Placeholder for future implementation
- **QR Codes**: Dialog with generated QR code SVG pointing to `/menu/:slug`
- Order count badge on sidebar "Orders" nav item
- Sound notification on new incoming order (10s polling)

---

## Components

### ProtectedRoute
```jsx
// Checks localStorage for token, redirects to /login if absent
<ProtectedRoute>
  <AdminDashboard />
</ProtectedRoute>
```

---

## Hooks

### useCart
Location: `hooks/useCart.js`

Manages shopping cart state synced with localStorage. See [State Management](#client-state--localstorage) for full API.

---

## Demo Mode

For pitching to potential restaurant clients without needing a backend:

- **Trigger**: Visit `/menu/demo`
- **Data source**: `demoData.js` with hardcoded menu items
- **Coverage**: Full flow works — Menu → Add to Cart → Checkout → OTP (bypassed) → Order Success
- **Identification**: `slug === 'demo'` or `id === 'demo_order_id'`
- **Cleanup**: Marked with `// DEMO ONLY: Remove this later` comments

### Demo Menu Items
| Item | Price | Category |
|------|-------|----------|
| Harvest Grain Bowl | ₹450 | Signature Dishes |
| Wild Mushroom Pizza | ₹680 | Signature Dishes |
| Midnight Cocoa Fondant | ₹380 | Desserts |
| Hibiscus Negroni | ₹520 | Cocktails |
