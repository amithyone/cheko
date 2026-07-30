# Cheko POS

Multi-terminal point of sale for supermarket, restaurant, services, hotel, and flight booking workflows.

**UI / UX design:** [Innocent Amithy Solomon (Amithy)](https://profile.amithyone.com/)

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run dev:desktop   # Electron + Vite (Windows POS shell — use this for native testing)
npm run start:desktop # Electron only (requires npm run build:desktop first)
npm run build    # → dist/
npm run build:desktop   # Windows installer (NSIS x64)
npm run lint
```

Copy `.env.example` to `.env` when wiring the backend API.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/BACKEND_HANDOFF.md](docs/BACKEND_HANDOFF.md) | Full backend integration guide |
| [docs/FULL_STACK_WINDOWS_POS.md](docs/FULL_STACK_WINDOWS_POS.md) | Windows POS, hardware, backend fusion, business modes |
| [docs/README.md](docs/README.md) | Documentation index |
| [CREDITS.md](CREDITS.md) | Design attribution |

## Live demo

https://cheko.check-outnow.com

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4
