# Component inventory

## App shell

| Path | Type | Purpose |
|------|------|---------|
| `src/app/App.tsx` | entry | Providers + AppShell |
| `src/app/AppShell.tsx` | shell | Auth gate, sidebar, tab outlet, terminal overlay |
| `src/app/providers.tsx` | provider | NoticeProvider wrapper |
| `src/shared/layout/Sidebar.tsx` | layout | Role-filtered nav |
| `src/shared/layout/Header.tsx` | layout | Title, search, status |

## Auth

| Path | Type | Purpose |
|------|------|---------|
| `features/auth/pages/LoginPage.tsx` | page | Demo role login |
| `features/auth/api.ts` | api stub | login, logout, me |

## Dashboard

| Path | Type | Purpose |
|------|------|---------|
| `features/dashboard/pages/DashboardPage.tsx` | page | Store health, revenue, disputes |

## Catalog

| Path | Type | Purpose |
|------|------|---------|
| `features/catalog/inventory/pages/InventoryPage.tsx` | page | Catalog orchestration, filters, codes hub |
| `features/catalog/inventory/hooks/useInventoryFilters.ts` | hook | Search, segment, category, tag filters |
| `features/catalog/inventory/modals/AddSkuModal.tsx` | modal | Register SKU, barcode scan, variations |
| `features/catalog/inventory/modals/EditProductModal.tsx` | modal | Edit product and variations |
| `features/catalog/inventory/components/ProductTable.tsx` | component | Catalog table + empty state |
| `features/catalog/inventory/components/StockBadge.tsx` | component | Stock level indicator |
| `features/catalog/inventory/components/BarcodeRenderer.tsx` | component | SKU barcode SVG |
| `features/catalog/inventory/components/QrCodeRenderer.tsx` | component | QR preview |
| `features/catalog/categories/pages/CategoryTagsPage.tsx` | page | Category & tag admin |
| `features/catalog/inventory/api.ts` | api stub | products, categories, tags |

## POS — Checkout

| Path | Type | Purpose |
|------|------|---------|
| `features/pos/checkout/pages/CheckoutPage.tsx` | page | Register orchestration |
| `features/pos/checkout/components/CartPanel.tsx` | component | Cart list, totals, charge |
| `features/pos/checkout/components/ProductPicker.tsx` | component | Product grid, scan, categories |
| `features/pos/checkout/components/IntercomDrawer.tsx` | component | Lane intercom drawer |
| `features/pos/checkout/components/CustomKeypad.tsx` | component | Manager custom tender keypad |
| `features/pos/checkout/hooks/useCheckoutTotals.ts` | hook | Subtotal, tax, total |
| `features/pos/checkout/modals/AdminUnlockModal.tsx` | modal | Manager code for custom tender |
| `features/pos/checkout/modals/ParkCartModal.tsx` | modal | Park cart with customer label |

## POS — Terminal

| Path | Type | Purpose |
|------|------|---------|
| `features/pos/terminal/TerminalPayModal.tsx` | modal overlay | NFC, cash, transfer, split |
| `features/pos/terminal/hooks/usePaymentFlow.ts` | hook/types | Phase constants, split ratios |
| `features/pos/terminal/api.ts` | api stub | charge, transfer confirm, print |

## Cash Point

| Path | Type | Purpose |
|------|------|---------|
| `features/cash-point/pages/CashPointPage.tsx` | page | Orchestrator |
| `features/cash-point/flows/DigitalToCashFlow.tsx` | flow | Digital in → cash out |
| `features/cash-point/flows/CashToBankFlow.tsx` | flow | Cash in → bank send |
| `features/cash-point/components/AccountDetailsCard.tsx` | component | Receive account display |
| `features/cash-point/components/TransactionHistoryPanel.tsx` | component | Right sidebar history |
| `features/cash-point/components/ServiceModeToggle.tsx` | component | Mode switcher |
| `features/cash-point/hooks/useCashPointSettlement.ts` | hook | Fee math, API simulators |
| `features/cash-point/api.ts` | api stub | incoming transfer, outbound NIP |

## Orders

| Path | Type | Purpose |
|------|------|---------|
| `features/orders/pages/OnlineOrdersPage.tsx` | page | Delivery pipeline orchestration |
| `features/orders/components/OrderCard.tsx` | component | Order list card, status actions |
| `features/orders/components/OrderBuilder.tsx` | component | Cart builder for new orders |
| `features/orders/components/OrderStatusBadge.tsx` | component | Status pill |
| `features/orders/modals/NewOrderModal.tsx` | modal | Take new delivery order |
| `features/orders/modals/SettlementModal.tsx` | modal | NUBAN settlement gateway |
| `features/orders/modals/SettlementSuccessModal.tsx` | modal | Payment confirmed |
| `features/orders/modals/QuickSearchStoreModal.tsx` | modal | Quick product search |
| `features/orders/api.ts` | api stub | CRUD, settlement, driver |

## Customers

| Path | Type | Purpose |
|------|------|---------|
| `features/customers/pages/CustomersPage.tsx` | page | CRM list + add modal inline |
| `features/customers/api.ts` | api stub | list, create |

## Audit

| Path | Type | Purpose |
|------|------|---------|
| `features/audit/pages/AuditPage.tsx` | page | Terminal reconciliation |
| `features/audit/api.ts` | api stub | terminals, reconciliation |

## Chat

| Path | Type | Purpose |
|------|------|---------|
| `features/chat/pages/ManagerChatPage.tsx` | page | Manager intercom |
| `features/chat/api.ts` | api stub | messages |

## Settings

| Path | Type | Purpose |
|------|------|---------|
| `features/settings/pages/SettingsPage.tsx` | page | Currency, business type |

## Shared UI

| Path | Exports |
|------|---------|
| `shared/ui/Modal.tsx` | Modal, ModalHeader |
| `shared/ui/Button.tsx` | Button (variants) |
| `shared/ui/Input.tsx` | Input, Select, Textarea |
| `shared/ui/Card.tsx` | Card, Badge, StatTile |
| `shared/utils/money.ts` | formatCurrency, roundMoney |

## Global context

| Path | Purpose |
|------|---------|
| `context/NoticeContext.tsx` | Toasts, alert modal, confirm modal — uses shared Modal/Button |
