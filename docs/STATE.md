# Client state

## Hooks (`src/hooks/`)

| Hook | Responsibility |
|------|----------------|
| `useAppNavigation` | Tab, sidebar collapse, header titles |
| `useCatalog` | Products by business type, categories, tags |
| `useCart` | Cart, parked carts, terminal open state |
| `useChat` | Intercom messages + simulated replies |
| `useTerminalAudits` | Terminal 01–04 audit rows |
| `useTransactions` | Transaction feed + total revenue |

## AppShell local state

- `isAuthenticated`, `userRole`
- `currencySymbol`
- `stores` (dashboard)
- `cashPointHistory`

## Feature-local state

| Feature | Local state | Move to API |
|---------|-------------|-------------|
| OnlineOrdersPage | `onlineOrders`, settlement modals | Yes |
| CustomersPage | `customers`, add modal | Yes |
| DashboardPage | disputes (inline) | Yes — use `mock/disputes.ts` seed |
| InventoryPage | filters, modals | Filters stay client-side |
| CashPointPage | payment phases | Phases stay UI; amounts from API |

## Persistence

Currently **none** — refresh resets to mock seeds except in-memory session.

Backend should provide:

- Auth token (httpOnly cookie or Bearer)
- Server-side cart for multi-device
- Immutable transaction log
- WebSocket for transfers and chat
