# Cheko POS — Backend Developer Handoff

**Document version:** 2026-05-29  
**Frontend status:** Ready for backend integration (UI-complete demo)  
**Live demo:** https://cheko.check-outnow.com  
**Repo path:** `/var/www/cheko`

---

## 1. Executive summary

The Cheko frontend is a **feature-complete POS demo** built in React 19 + TypeScript. All user flows work end-to-end using **in-memory mock data**. API integration points are defined as typed stubs in `src/features/*/api.ts` — each stub currently throws `"Not implemented"`.

**Verdict: Yes — ready to hand off to a backend developer.**

The frontend is suitable as:

- A **UI/UX contract** for screens, modals, and workflows
- A **TypeScript schema reference** for request/response shapes (`src/types/`)
- A **integration checklist** via `api.ts` stubs and this document

It is **not** production-ready until the backend replaces mocks with real APIs, auth, and payment gateways.

| Area | Status |
|------|--------|
| UI / UX flows | Complete |
| TypeScript types | Complete |
| API stubs (typed) | Complete (8 feature modules + hotel + flights) |
| Real HTTP calls | Not wired |
| Authentication | Mock login (role picker) |
| Persistence | None — refresh resets state |
| Build / lint | Passes (`npm run lint`, `npm run build`) |
| Documentation | This file + `docs/*.md` |

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Animation | Motion (Framer) — payment modal only |
| Routing | Tab state (`useAppNavigation`) — **no React Router** |

### Commands

```bash
cd /var/www/cheko
npm install
npm run dev       # http://localhost:3000
npm run lint      # tsc --noEmit
npm run build     # → dist/
```

### Deploy

```bash
npm run build
sudo chown -R www-data:www-data dist
```

Apache vhost configs: `deploy/`. Production serves static `dist/`.

### Path alias

`@/` → `src/` (see `vite.config.ts`, `tsconfig.json`).

---

## 3. Architecture

```
src/
├── app/
│   ├── App.tsx              Entry
│   ├── AppShell.tsx         Auth gate, tab router, global hooks
│   └── providers.tsx        InteractionMode + Notice providers
├── features/                Domain modules
│   ├── auth/
│   ├── audit/
│   ├── cash-point/
│   ├── catalog/inventory/
│   ├── catalog/categories/
│   ├── chat/
│   ├── customers/
│   ├── dashboard/
│   ├── flights/             api.ts + components
│   ├── hotel/               api.ts + components
│   ├── orders/
│   ├── pos/checkout/
│   ├── pos/terminal/
│   └── settings/
├── hooks/                   Cross-cutting client state
├── types/                   Domain models (align with API JSON)
├── mock/                    Seed data — replace with API
├── shared/
│   ├── ui/                  Modal, Button, Input, TouchDateInput, …
│   ├── layout/              Sidebar, Header
│   └── utils/               money, hotel, business-types, calendar
└── context/
    ├── NoticeContext.tsx    Toasts, alerts, confirm dialogs
    and InteractionModeContext.tsx  Mouse vs touch UI density
```

### Data flow (today)

```
Mock seeds → useState/useHook → Pages → User actions → Local state updates
```

### Target data flow

```
API → api.ts fetch wrappers → hooks/pages → User actions → API mutations → state refresh
```

---

## 4. Navigation & roles

Tab routing is a string `currentTab` in `useAppNavigation`. No URL routes yet — backend dev may add React Router later.

### Tab IDs

| Tab ID | Page | Primary roles |
|--------|------|---------------|
| `dashboard` | Dashboard | Store Manager |
| `inventory` | Product catalog CRUD | Store Manager |
| `categories_tags` | Categories & tags | Store Manager |
| `checkout` | POS cart + terminal pay | Store Manager, Sales Rep |
| `cash_point` | Cash disbursement | Cash Point Officer |
| `online_orders` | Delivery order queue | Store Manager, Online Dispatcher |
| `order_history` | In-store + online + cash point history | All roles |
| `customers` | CRM list | Store Manager |
| `chat` | Manager intercom | Store Manager |
| `audit` | Terminal reconciliation | Store Manager, Sales Rep |
| `settings` | Currency, business type, staff accounts | Store Manager |

### Roles (`src/types/auth.ts`)

- `Store Manager`
- `Sales Rep`
- `Online Sales Dispatcher`
- `Cash Point Officer`

Login landing tab per role is defined in `useAppNavigation` → `ROLE_DEFAULT_TAB`.

**Important:** Sidebar visibility is cosmetic. **Enforce RBAC on every API route server-side.**

### Manager override

Code `MG-9941` (`ADMIN_TENDER_OVERRIDE_CODE`) unlocks custom tender keypad on checkout.

---

## 5. Business terminal modes

Configured in Settings → **Corporate Terminal Type** (`BusinessType` in `src/types/catalog.ts`).

| Mode | Checkout behavior |
|------|-------------------|
| `Supermarket` | Grocery product grid |
| `Restaurant` | Menu items |
| `Services` | Service desk quick actions (walk-ins, appointments) |
| `Hotels` | Hotel management panel + folio posting to cart |
| `Flights` | Flight search/booking panel; fare added to cart as product |

Product catalogs switch via `useCatalog` (`src/hooks/useCatalog.ts`) based on `businessType`. Backend should either:

- Return products filtered by `?businessType=Hotels`, or
- Store terminal config server-side and return the active catalog for the logged-in terminal

---

## 6. Client state ownership

### Global hooks (`src/hooks/`)

| Hook | State | Backend target |
|------|-------|------------------|
| `useAppNavigation` | Tab, search, sidebar | Optional URL sync |
| `useCatalog` | Products, categories, tags, businessType | `/catalog/*` |
| `useCart` | Cart, parked carts, terminal modal | Session/server cart |
| `useChat` | Intercom messages | WebSocket `/chat` |
| `useTerminalAudits` | Terminal 01–04 audit rows | `/audit/terminals` |
| `useTransactions` | Transaction feed, revenue | `/transactions` |
| `useHotelManagement` | Rooms, folios, check-in/out | `/hotel/*` |
| `useFlightBooking` | Search, bookings, PNR | `/flights/*` |

### AppShell local state

| State | Purpose | Backend target |
|-------|---------|----------------|
| `isAuthenticated`, `userRole` | Session | JWT / session cookie |
| `currencySymbol` | Display formatting | Terminal settings |
| `stores` | Dashboard multi-store | `/stores` |
| `cashPointHistory` | Cash point ledger | `/cash-point/history` |
| `staffAccounts` | Settings account manager | `/staff` |

### Simulated behavior (remove when wiring API)

- Dashboard revenue ticker (`setInterval` in `AppShell`) — replace with real aggregates
- Chat auto-replies in `useChat` — replace with WebSocket
- Payment delays in `TerminalPayModal` — replace with gateway callbacks
- Flight search filters mock `FLIGHT_OFFERS` — replace with GDS/search API

---

## 7. Mock data inventory

All seeds live in `src/mock/`. Imported via `src/mock/index.ts`.

| File | Contents |
|------|----------|
| `products.ts` | SKUs per business type (supermarket, restaurant, services, hotel, flights) |
| `categories.ts`, `tags.ts` | Catalog metadata |
| `transactions.ts` | Recent POS transactions |
| `terminals.ts` | Terminal audit rows |
| `orders.ts` | Online delivery queue |
| `order-history.ts` | Completed order history rows |
| `customers.ts` | CRM records |
| `chat.ts` | Intercom seed messages |
| `cash-point-history.ts` | Cash disbursement records |
| `staff-accounts.ts` | Demo operator accounts |
| `hotel-rooms.ts` | Hotel rooms + folios |
| `flights.ts`, `flight-bookings.ts` | Airports, offers, bookings |
| `stores.ts`, `regions.ts`, `disputes.ts` | Dashboard data |

**Swap pattern:**

```typescript
// Before (demo)
const [rooms, setRooms] = useState(INITIAL_HOTEL_ROOMS);

// After (backend)
useEffect(() => {
  listRooms().then(setRooms).catch((e) => notice.showError(e.message));
}, []);
```

---

## 8. API specification

**Suggested base URL:** `https://api.cheko.example.com/api/v1`

**Auth header:** `Authorization: Bearer <token>` (after login)

**Content-Type:** `application/json`

Each endpoint has a typed stub in the listed file. Implement stubs first, then wire hooks/pages.

---

### 8.1 Auth & staff

**File:** `src/features/auth/api.ts`

| Method | Path | Function | Notes |
|--------|------|----------|-------|
| POST | `/auth/login` | `login()` | Returns `{ token, role, displayName }` |
| POST | `/auth/logout` | `logout()` | Invalidate session |
| GET | `/auth/me` | `getCurrentUser()` | Current session |
| GET | `/staff` | `listStaffAccounts()` | Settings account manager |
| POST | `/staff` | `createStaffAccount()` | |
| PATCH | `/staff/:id` | `updateStaffAccount()` | |
| DELETE | `/staff/:id` | `deleteStaffAccount()` | |

**Types:** `LoginRequest`, `LoginResponse`, `StaffAccount`, `UserRole` in `src/types/auth.ts`.

**Frontend login today:** `LoginPage` calls `onLoginSuccess(role)` with no password validation. Replace with `login({ username, password })`.

---

### 8.2 Catalog / inventory

**File:** `src/features/catalog/inventory/api.ts`

| Method | Path | Function |
|--------|------|----------|
| GET | `/catalog/products?businessType=` | `listProducts()` |
| POST | `/catalog/products` | `createProduct()` |
| PATCH | `/catalog/products/:sku` | `updateProduct()` |
| DELETE | `/catalog/products/:sku` | `deleteProduct()` |
| GET | `/catalog/categories` | `listCategories()` |
| GET | `/catalog/tags` | `listTags()` |

**Type:** `Product` in `src/types/catalog.ts`

```typescript
interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  color: string;
  stock: number;
  stockIntegrity: "Optimal" | "Critical";
  segment: "Footwear" | "Apparel" | "Accessories" | "Limited";
  tags?: string[];
  variations?: { id: string; size: string; color: string; stock: number }[];
}
```

Stock decrements on payment success in `AppShell.handlePaymentSuccess` — backend should decrement atomically on payment confirmation.

---

### 8.3 POS terminal payments

**File:** `src/features/pos/terminal/api.ts`

| Method | Path | Function |
|--------|------|----------|
| POST | `/terminal/payments/nfc-charge` | `chargeCard()` |
| POST | `/terminal/payments/transfer/confirm` | `confirmBankTransfer()` |
| POST | `/terminal/payments/split` | `submitSplitPayment()` |
| POST | `/terminal/receipt/print` | `printReceipt()` |

**UI:** `TerminalPayModal.tsx` — phase machine for cash, transfer, NFC, split.

**Request/response types** are defined in the same `api.ts` file.

Split payment ratios (client-side today): `SPLIT_CASH_RATIO`, `SPLIT_TRANSFER_1_RATIO`, `SPLIT_TRANSFER_2_RATIO` in `usePaymentFlow.ts`. Backend should validate totals.

---

### 8.4 Cash point

**File:** `src/features/cash-point/api.ts`

| Method | Path | Function |
|--------|------|----------|
| WS or SSE | `/cash-point/transfers/incoming` | `listenIncomingTransfer()` |
| POST | `/cash-point/payments/card-charge` | `cashPointChargeCard()` |
| POST | `/cash-point/transfers/outbound` | `sendOutboundTransfer()` |
| GET | `/cash-point/history` | *(add when wiring — used by AppShell state)* |

**Types:** `CashDisbursementRecord`, `CashPointPayPhase` in `src/types/cash-point.ts`.

Fee rate constant: `CASH_DISBURSEMENT_FEE_RATE = 0.05` (5%).

---

### 8.5 Online orders

**File:** `src/features/orders/api.ts`

| Method | Path | Function |
|--------|------|----------|
| GET | `/orders` | `listOrders()` |
| POST | `/orders` | `createOrder()` |
| PATCH | `/orders/:id/status` | `updateOrderStatus()` |
| POST | `/orders/:id/assign-driver` | `assignDriver()` |
| POST | `/orders/:id/settlement/confirm` | `confirmOrderPayment()` |
| GET | `/orders/history` | `listOrderHistory()` |

**Types:** `DeliveryOrder`, `OrderHistoryRow` in `src/types/orders.ts`.

Order history page merges:

- In-store transactions from `useTransactions`
- Cash point records from `cashPointHistory`
- Mock completed online orders from `COMPLETED_ONLINE_ORDER_HISTORY`

Backend should unify these in `GET /orders/history`.

---

### 8.6 Customers

**File:** `src/features/customers/api.ts`

| Method | Path | Function |
|--------|------|----------|
| GET | `/customers` | `listCustomers()` |
| POST | `/customers` | `createCustomer()` |

**Type:** `Customer` in `src/types/customers.ts`.

---

### 8.7 Audit

**File:** `src/features/audit/api.ts`

| Method | Path | Function |
|--------|------|----------|
| GET | `/audit/terminals` | `listTerminalAudits()` |
| POST | `/audit/terminals/:id/reconcile` | `reconcileTerminal()` |

**Type:** `TerminalAudit` in `src/types/terminal.ts`.

---

### 8.8 Chat / intercom

**File:** `src/features/chat/api.ts`

| Method | Path | Function |
|--------|------|----------|
| GET | `/chat/messages` | `listMessages()` |
| POST | `/chat/messages` | `sendMessage()` |

Recommend **WebSocket** for real-time cashier ↔ manager chat. Type: `ChatMessage` in `src/types/chat.ts`.

---

### 8.9 Hotel / property management

**File:** `src/features/hotel/api.ts`  
**Hook:** `src/hooks/useHotelManagement.ts`  
**UI:** `HotelManagementPanel`, `CheckInModal`, `AddRoomModal`

| Method | Path | Function |
|--------|------|----------|
| GET | `/hotel/rooms` | `listRooms()` |
| POST | `/hotel/rooms` | `createRoom()` |
| DELETE | `/hotel/rooms/:id` | `deleteRoom()` |
| PATCH | `/hotel/rooms/:id/status` | `updateRoomStatus()` |
| POST | `/hotel/rooms/:id/check-in` | `checkInGuest()` |
| POST | `/hotel/rooms/:id/check-out` | `checkOutGuest()` |
| POST | `/hotel/rooms/:id/extend-stay` | `extendStay()` |
| POST | `/hotel/rooms/:id/folio` | `postFolioCharge()` |

**Types:** `src/types/hotel.ts`

Key workflows:

1. **Check-in** — posts room charge to folio for `(checkOut - checkIn)` nights
2. **Post cart to folio** — POS charges from checkout cart posted to occupied room
3. **Extend stay** — additional nights charged
4. **Check-out** — settle folio, room → vacant

---

### 8.10 Flights / travel desk

**File:** `src/features/flights/api.ts`  
**Hook:** `src/hooks/useFlightBooking.ts`  
**UI:** `FlightBookingPanel`, `BookPassengersModal`

| Method | Path | Function |
|--------|------|----------|
| GET | `/flights/airports` | `listAirports()` |
| POST | `/flights/search` | `searchFlights()` |
| GET | `/flights/bookings` | `listBookings()` |
| POST | `/flights/bookings` | `createBooking()` |
| POST | `/flights/bookings/:id/check-in` | `checkInBooking()` |
| POST | `/flights/bookings/:id/cancel` | `cancelBooking()` |

**Types:** `src/types/flights.ts`

Booking creates a `Product` via `flightBookingToProduct()` and adds to POS cart. Payment goes through normal terminal flow.

**PNR** is generated client-side today (`generatePnr()` in mock) — move to server.

---

## 9. Recommended integration order

1. **Auth** — JWT/session, wire `LoginPage`, protect AppShell
2. **Catalog** — products, categories, tags; wire `useCatalog`
3. **Transactions + audit** — payment logging, terminal audits
4. **Terminal payments** — replace simulated delays in `TerminalPayModal`
5. **Cash point** — incoming transfer webhooks, outbound NIP
6. **Orders** — online queue + unified order history
7. **Customers, chat** — CRM + WebSocket
8. **Hotel, flights** — vertical-specific modules
9. **Settings** — persist currency, business type, staff accounts server-side

---

## 10. Shared HTTP client (suggested)

Create once, use in all `api.ts` files:

```typescript
// src/shared/api/client.ts
const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("cheko_token"); // or httpOnly cookie
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

Add to `.env`:

```
VITE_API_BASE_URL=https://api.cheko.example.com/api/v1
```

Errors should surface via `useNotice()` → `notice.showError(message)`.

---

## 11. UI components backend devs should know

| Component | Path | Notes |
|-----------|------|-------|
| `Modal` | `shared/ui/Modal.tsx` | Keyboard-aware in touch mode (visual viewport) |
| `TouchDateInput` | `shared/ui/TouchDateInput.tsx` | Touch mode opens `TouchDatePickerModal` |
| `NoticeContext` | `context/NoticeContext.tsx` | Toasts, confirms — use for API errors |
| `InteractionModeToggle` | Header + Settings | Mouse vs touch density; persisted in localStorage |

Do not duplicate modal markup — extend `@/shared/ui`.

---

## 12. Known gaps (non-blocking for handoff)

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No React Router | No deep links | Add when API is stable |
| No `.env.example` | Dev setup friction | Add `VITE_API_BASE_URL` |
| No automated tests | Regression risk | Add after API wiring |
| `mockData.ts` deprecated shim | Confusion | Use `@/mock` only |
| Revenue ticker simulated | Misleading dashboard | Remove when API live |
| Passwords in `StaffAccount` mock | Security | Never return passwords from API |
| Product `segment` enum legacy | Footwear values in type | Backend can extend enum |
| Chat uses simulated replies | Not real-time | WebSocket required |

---

## 13. TypeScript type index

All exported from `src/types/index.ts`:

| Module | Key types |
|--------|-----------|
| `auth.ts` | `UserRole`, `StaffAccount`, `TerminalAccountType` |
| `catalog.ts` | `Product`, `BusinessType`, `CategoryItem`, `TagItem` |
| `pos.ts` | `CartItem` |
| `terminal.ts` | `TerminalAudit`, `Transaction`, `DisputeTicket` |
| `cash-point.ts` | `CashDisbursementRecord`, `CashPointPayPhase`, `ServiceMode` |
| `orders.ts` | `DeliveryOrder`, `OrderHistoryRow` |
| `customers.ts` | `Customer` |
| `chat.ts` | `ChatMessage` |
| `hotel.ts` | `HotelRoom`, `FolioEntry`, `CheckInPayload`, `AddRoomPayload` |
| `flights.ts` | `FlightOffer`, `FlightBooking`, `FlightSearchParams`, `PassengerInfo` |
| `common.ts` | Shared utilities |

**Keep API JSON responses aligned with these types.** Frontend will import them in `api.ts` return types.

---

## 14. Payment & flow reference

Detailed phase machines documented in:

- `docs/FLOWS.md` — terminal pay + cash point phases
- `docs/MODALS.md` — every modal and trigger
- `docs/COMPONENTS.md` — component inventory

---

## 15. Checklist for backend developer

- [ ] Read `src/types/` for JSON contracts
- [ ] Implement endpoints matching `src/features/*/api.ts`
- [ ] Add `VITE_API_BASE_URL` and shared `apiFetch` client
- [ ] Wire `LoginPage` → `auth/api.login`
- [ ] Replace mock seeds in hooks with `useEffect` + API calls
- [ ] Enforce RBAC server-side per `UserRole`
- [ ] Integrate payment gateway for NFC/transfer
- [ ] WebSocket for cash-point incoming transfers + chat
- [ ] Persist terminal settings (currency, business type)
- [ ] Unified order history endpoint
- [ ] Hotel folio charges tied to POS transaction IDs
- [ ] Flight PNR issuance server-side

---

## 16. Contact & repo structure

| Resource | Location |
|----------|----------|
| Architecture | `docs/ARCHITECTURE.md` |
| API stubs list | `docs/API_STUBS.md` |
| State map | `docs/STATE.md` |
| Roles | `docs/ROLES.md` |
| This handoff | `docs/BACKEND_HANDOFF.md` |

**Build verified:** `npm run lint` and `npm run build` pass as of 2026-05-29.

---

## 17. Design credit

Cheko POS **UI / UX** — layouts, components, touch/mouse interaction modes, modals, and visual system:

**Innocent Amithy Solomon (Amithy)**  
[https://profile.amithyone.com/](https://profile.amithyone.com/)

See `CREDITS.md` and in-app credits (login, sidebar, settings, footer).

---

*End of backend handoff document.*
