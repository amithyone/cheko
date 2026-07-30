# Cheko POS — Frontend

Cheko is a React + Vite point-of-sale demo for retail, supermarket, restaurant, services, hotel, and flight workflows.

**UI / UX design:** [Innocent Amithy Solomon (Amithy)](https://profile.amithyone.com/) — see [CREDITS.md](../CREDITS.md).

## Stack

- **React 19** + **TypeScript**
- **Vite 6** (build)
- **Tailwind CSS 4**
- **Lucide** icons

## Quick start

```bash
cd /var/www/cheko
npm install
npm run dev      # http://localhost:3000
npm run build    # output: dist/
npm run lint     # tsc --noEmit
```

## Deploy

Production static files live in `dist/`. Apache vhosts are under `deploy/`.

```bash
npm run build
sudo chown -R www-data:www-data dist
```

Live URL: https://cheko.check-outnow.com

## Demo login roles

| Role | Default tab |
|------|-------------|
| Store Manager | Dashboard |
| Sales Rep | Checkout |
| Cash Point Officer | Cash Point |
| Online Sales Dispatcher | Online Orders |

## Documentation index

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder layout, data flow |
| [COMPONENTS.md](./COMPONENTS.md) | Component inventory |
| [MODALS.md](./MODALS.md) | All modals and triggers |
| [FLOWS.md](./FLOWS.md) | Payment & cash-point phase machines |
| [API_STUBS.md](./API_STUBS.md) | Backend endpoints to implement |
| [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md) | **Full backend integration guide (start here)** |
| [FULL_STACK_WINDOWS_POS.md](./FULL_STACK_WINDOWS_POS.md) | **Windows app, hardware, broadcast, restaurant & supermarket roadmap** |
| [CREDITS.md](../CREDITS.md) | Design attribution — Amithy |
| [STATE.md](./STATE.md) | Client state ownership |
| [ROLES.md](./ROLES.md) | Role → navigation matrix |

## Backend integration

Each feature folder contains an `api.ts` stub. Replace `throw new Error("Not implemented")` with `fetch()` calls to your Laravel/API backend. See [API_STUBS.md](./API_STUBS.md).
