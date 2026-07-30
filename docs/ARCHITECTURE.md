# Architecture

## Layer diagram

```
src/
├── app/           Shell, providers, tab routing
├── features/      Domain modules (pages, components, modals, api.ts)
├── shared/        UI kit, layout, utils
├── hooks/         Cross-feature app state
├── types/         Domain TypeScript models
├── mock/          Seed data (replace with API)
└── context/       Global NoticeProvider (toasts, alerts, confirm)
```

## Navigation

Tab-based routing via `currentTab` string in `useAppNavigation`. No React Router yet — backend dev may add URL routes later.

Tab IDs: `dashboard`, `inventory`, `categories_tags`, `checkout`, `cash_point`, `online_orders`, `customers`, `chat`, `audit`, `settings`.

## State ownership

| State | Location | Backend target |
|-------|----------|----------------|
| Auth / role | `AppShell` | JWT session |
| Catalog products | `useCatalog` | `/api/v1/catalog/products` |
| Cart / parked carts | `useCart` | Session or server cart |
| Terminal audits | `useTerminalAudits` | `/api/v1/audit/terminals` |
| Transactions / revenue | `useTransactions` | `/api/v1/transactions` |
| Chat | `useChat` | WebSocket `/api/v1/chat` |
| Cash point history | `AppShell` | `/api/v1/cash-point/history` |
| Online orders | `OnlineOrdersPage` local | `/api/v1/orders` |
| Customers | `CustomersPage` local | `/api/v1/customers` |

## Import aliases

`@/` → `src/` (configured in `vite.config.ts` and `tsconfig.json`).

## Shared UI

Use `@/shared/ui` for Modal, Button, Input, Card, Badge, StatTile. Do not duplicate overlay markup in feature modals.

## Adding a feature

1. Create `src/features/<name>/pages/<Name>Page.tsx`
2. Add `api.ts` with typed stubs
3. Register tab in `Sidebar.tsx` and `AppShell.tsx`
4. Document in `COMPONENTS.md` and `API_STUBS.md`
