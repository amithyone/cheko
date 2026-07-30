# Modals reference

## Global (NoticeContext)

| Modal | Trigger | API on confirm |
|-------|---------|----------------|
| Toast | `useNotice().showToast()` | None |
| Alert | `showSuccess/Info/Warning/Error()` | Dismiss only |
| Confirm | `showConfirm()` | User `onConfirm` callback |

## POS — TerminalPayModal

Full-screen overlay. Phases: method select → method-specific await → success.

| Method | Simulated API | Backend |
|--------|---------------|---------|
| NFC/Card | Simulate tap + approve | `POST /terminal/payments/nfc-charge` |
| Cash | Enter amount received | Local drawer update |
| Bank Transfer | Simulate transfer | `POST /terminal/payments/transfer/confirm` |
| Split | Cash + 2 transfers | Combined endpoints |

## POS — AdminUnlockModal

| Field | Validation |
|-------|------------|
| Manager code | Must match `ADMIN_TENDER_OVERRIDE_CODE` (`MG-9941`) |

## Cash Point

Flows use inline phases (not separate modal files). API simulation buttons map to:

- Incoming transfer webhook
- Card charge approval
- Outbound NIP transfer

## Inventory

| Modal | Path | Trigger |
|-------|------|---------|
| Add SKU | `modals/AddSkuModal.tsx` | "Register new SKU" |
| Edit product | `modals/EditProductModal.tsx` | Edit icon on row |
| Delete confirm | NoticeContext `showConfirm` | Delete icon |

## Online Orders

| Modal | Path | Trigger |
|-------|------|---------|
| New order builder | `modals/NewOrderModal.tsx` | "Take new order" |
| Settlement / bank details | `modals/SettlementModal.tsx` | Payment on order |
| Settlement success | `modals/SettlementSuccessModal.tsx` | After API credit |
| Quick search store | `modals/QuickSearchStoreModal.tsx` | Search in order builder |

## POS — Checkout

| Modal | Path | Trigger |
|-------|------|---------|
| Park cart | `modals/ParkCartModal.tsx` | Park cart button |
| Admin unlock | `modals/AdminUnlockModal.tsx` | Custom tender unlock |

## Customers

| Modal | Trigger |
|-------|---------|
| Add customer | "Add customer" |

## Categories / Tags

| Modal | Trigger |
|-------|---------|
| Category/Tag form | Add or edit row |

## Backend notes

Replace all "Simulate …" buttons with real API polling or WebSocket events. Show errors via `useNotice().showError()`.
