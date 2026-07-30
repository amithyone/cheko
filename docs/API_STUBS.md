# API stubs — backend handoff

All stubs live in `src/features/*/api.ts`. Replace implementations with `fetch` to your API base URL.

Suggested base: `https://api.cheko.example.com/api/v1`

## Auth

| Method | Path | Stub file |
|--------|------|-----------|
| POST | `/auth/login` | `features/auth/api.ts` |
| POST | `/auth/logout` | `features/auth/api.ts` |
| GET | `/auth/me` | `features/auth/api.ts` |

## Catalog

| Method | Path | Stub file |
|--------|------|-----------|
| GET | `/catalog/products` | `features/catalog/inventory/api.ts` |
| POST | `/catalog/products` | same |
| PATCH | `/catalog/products/:sku` | same |
| DELETE | `/catalog/products/:sku` | same |
| GET | `/catalog/categories` | same |
| GET | `/catalog/tags` | same |

## Terminal payments

| Method | Path | Stub file |
|--------|------|-----------|
| POST | `/terminal/payments/nfc-charge` | `features/pos/terminal/api.ts` |
| POST | `/terminal/payments/transfer/confirm` | same |
| POST | `/terminal/payments/split` | same |
| POST | `/terminal/receipt/print` | same |

## Cash point

| Method | Path | Stub file |
|--------|------|-----------|
| WS/GET | `/cash-point/transfers/incoming` | `features/cash-point/api.ts` |
| POST | `/cash-point/payments/card-charge` | same |
| POST | `/cash-point/transfers/outbound` | same |

## Orders

| Method | Path | Stub file |
|--------|------|-----------|
| GET | `/orders` | `features/orders/api.ts` |
| POST | `/orders` | same |
| PATCH | `/orders/:id/status` | same |
| POST | `/orders/:id/assign-driver` | same |
| POST | `/orders/:id/settlement/confirm` | same |

## Customers, audit, chat

See respective `api.ts` files under `features/customers`, `features/audit`, `features/chat`.

## Hotel & flights

| Method | Path | Stub file |
|--------|------|-----------|
| GET/POST/PATCH | `/hotel/rooms/*` | `features/hotel/api.ts` |
| POST | `/flights/search` | `features/flights/api.ts` |
| GET/POST | `/flights/bookings/*` | `features/flights/api.ts` |

Full contracts: [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md#89-hotel--property-management).

## Mock → real swap pattern

```typescript
// Before (demo)
const [orders, setOrders] = useState(INITIAL_ONLINE_ORDERS);

// After (backend)
const [orders, setOrders] = useState<DeliveryOrder[]>([]);
useEffect(() => {
  listOrders().then(setOrders).catch(err => notice.showError(err.message));
}, []);
```

Keep TypeScript types in `src/types/` aligned with API JSON responses.
