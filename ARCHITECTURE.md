# Architecture

## Overview

Replyfy is a role-based MERN application:

| Role | Frontend base | Backend prefix |
|------|---------------|----------------|
| User | `/dashboard` | `/api/users` |
| Expert | `/expert` | `/api/expert` |
| Admin | `/admin` | `/api/admin` |
| Public | `/` | `/api/categories`, `/api/public`, etc. |

Authentication uses JWT access tokens (Bearer header) with refresh tokens stored on the user document.

## Backend (`server/`)

### Request lifecycle

```
HTTP Request
  → helmet, cors, body parser
  → mongoSanitize
  → rateLimiter
  → route handler (auth + validate + controller)
  → service (business logic)
  → model (MongoDB)
  → JSON response
  → errorHandler (on failure)
```

### Layers

| Layer | Responsibility |
|-------|----------------|
| `routes/` | HTTP mapping, middleware chains, express-validator rules |
| `controllers/` | Parse request, call services/models, shape JSON response |
| `services/` | Reusable business logic (assignments, coupons, wallet, notifications, analytics) |
| `models/` | Mongoose schemas |
| `middleware/` | Auth, validation, upload, rate limit, sanitization, errors |
| `config/` | Environment, DB, CORS, third-party SDKs |
| `utils/` | Logger, ApiError, asyncHandler, uploadFiles, pagination, slug |
| `constants/` | Pricing plans and shared enums |

### Key services

- **assignmentService** — expert matching and assignment
- **couponService** — coupon validation and usage tracking
- **walletService** — expert wallet credits
- **notificationService** — in-app + email notifications
- **dashboardAnalytics** — admin chart aggregations
- **auditService** — audit log writes (fire-and-forget)

### Error handling

- `ApiError` — operational errors with `statusCode` and optional `errors`
- `asyncHandler` — wraps async route handlers, forwards rejections to `errorHandler`
- `errorHandler` — normalizes Mongoose validation, duplicate key, and cast errors

### Logging

`utils/logger.js` — development: human-readable; production: JSON structured logs.

## Frontend (`client/`)

### Structure

| Directory | Purpose |
|-----------|---------|
| `pages/` | Route-level views (admin, expert, user, marketing) |
| `layouts/` | Shell layouts (Admin, Expert, Dashboard) |
| `components/` | Feature and UI components by domain |
| `services/api/` | Axios client + domain API modules |
| `context/` | Auth state (`AuthContext`) |
| `hooks/` | Shared React Query hooks (`useCatalog`) |
| `routes/` | `ProtectedRoute`, `GuestRoute` |
| `utils/` | Currency formatting, dates, animations |
| `constants/` | Plans, roles |

### Data fetching

- **React Query** for server state (caching, refetch, mutations)
- **AuthContext** for session user profile
- API modules grouped: `authApi`, `userApi`, `expertApi`, `adminApi`, `catalogApi`, `notificationApi`

### Routing

Nested routes under layout shells (`AdminLayout`, `ExpertLayout`, `DashboardLayout`). Role guards redirect unauthorized users without changing URLs.

## Security

- Helmet security headers
- CORS with environment-aware origin allowlist
- Rate limiting (global + auth endpoints)
- Custom MongoDB query sanitization
- JWT with short-lived access tokens
- bcrypt password hashing (cost 12)
- Multer file type and size limits
- Razorpay HMAC verification (when configured)

## Data model (collections)

`users`, `expertprofiles`, `categories`, `experttypes`, `questions`, `answers`, `payments`, `coupons`, `wallets`, `transactions`, `withdrawrequests`, `ratings`, `notifications`, `questionassignments`, `auditlogs`

Collection names are managed by Mongoose — do not rename without migration.

## Refactoring guidelines

1. **Preserve API contracts** — response shapes and status codes are part of the public interface.
2. **Preserve UI** — extract components without changing class names or DOM structure visible to users.
3. **Move logic down** — new business logic goes in `services/`, not controllers.
4. **DRY utilities** — shared formatting, uploads, pagination in `utils/`.
5. **No dead code** — remove unused files and imports when safe.

## Future improvements (non-breaking)

- Repository layer for complex queries
- Dedicated validators directory mirroring routes
- Payment service extraction from userController
- Notification context on frontend
- Route-level code splitting with invisible Suspense fallback
