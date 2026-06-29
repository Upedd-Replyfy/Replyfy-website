# Replyfy

Enterprise Q&A marketplace — users ask questions, experts answer, admins moderate. MERN stack monorepo.

## Repository structure

```
replyfy/
├── client/          # React 19 + Vite SPA
├── server/          # Express 5 + MongoDB API
├── README.md
├── ARCHITECTURE.md
├── API.md
└── DEPLOYMENT.md
```

## Quick start (development)

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd server
cp .env.example .env   # fill MONGODB_URI, JWT secrets, etc.
npm install
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env   # optional in dev (Vite proxies /api)
npm install
npm run dev            # http://localhost:5173
```

### 3. Default roles

Register via `/signup`, then set `role` in MongoDB (`user` | `expert` | `admin`) or use admin flows to create experts.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `server/` | `npm run dev` | API with file watch |
| `server/` | `npm start` | Production API |
| `server/` | `npm run lint` | ESLint |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | Production build |
| `client/` | `npm run lint` | ESLint |
| `client/` | `npm run format` | Prettier (src) |

## Environment

See `server/.env.example` and `client/.env.example`. Never commit secrets.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design and code organization
- [API.md](./API.md) — HTTP API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment guide

## Refactoring principles

This codebase follows layered architecture: controllers handle HTTP, services hold business logic, models define persistence. Changes should preserve API contracts and UI behavior.
