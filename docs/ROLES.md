# Roles & navigation

## UserRole enum

Defined in `src/types/auth.ts`:

- `Store Manager`
- `Sales Rep`
- `Online Sales Dispatcher`
- `Cash Point Officer`

## Sidebar access

| Tab ID | Store Manager | Sales Rep | Cash Point Officer | Online Dispatcher |
|--------|:-------------:|:---------:|:------------------:|:-----------------:|
| dashboard | ✓ | | | |
| inventory | ✓ | | | |
| categories_tags | ✓ | | | |
| checkout | ✓ | ✓ | | |
| cash_point | ✓ | | ✓ | |
| online_orders | ✓ | | | ✓ |
| customers | ✓ | | | |
| chat | ✓ | | | |
| audit | ✓ | ✓ | | |
| settings | ✓ | | | |

## Login landing tab

| Role | Tab |
|------|-----|
| Store Manager | `dashboard` |
| Sales Rep | `checkout` |
| Cash Point Officer | `cash_point` |
| Online Sales Dispatcher | `online_orders` |

## Manager override

Code `MG-9941` unlocks custom tender keypad on checkout (`ADMIN_TENDER_OVERRIDE_CODE`).

## Backend RBAC

Map roles to API permissions. Frontend sidebar is cosmetic — enforce authorization on every API route.
