# API Reference

Base URL: `http://localhost:5000/api` (development)

All authenticated routes require header: `Authorization: Bearer <access_token>`

Standard success envelope: `{ success: true, ...data }`  
Standard error envelope: `{ success: false, message, errors?, stack? }`

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | API health check |

## Public catalog

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | No | List active categories |
| GET | `/expert-types?category=` | No | Expert types for category |
| GET | `/experts` | No | Expert listing (filters) |
| GET | `/stats` | No | Platform statistics |
| GET | `/public/categories` | No | Same as `/categories` |
| GET | `/public/expert-types` | No | Same as `/expert-types` |
| GET | `/public/experts` | No | Same as `/experts` |
| GET | `/public/experts/:id` | No | Expert profile detail |
| GET | `/public/stats` | No | Same as `/stats` |

## Auth (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register user |
| POST | `/login` | No | Login |
| POST | `/refresh` | No | Refresh access token |
| POST | `/logout` | Yes | Logout |
| GET | `/profile` | Yes | Current user profile |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/change-password` | Yes | Change password |

## User (`/users`) — role: `user`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/questions` | Create question (multipart) |
| GET | `/questions` | List own questions |
| GET | `/questions/:id` | Question detail |
| POST | `/payments/validate-coupon` | Validate coupon |
| POST | `/payments/create-order` | Create Razorpay order |
| POST | `/payments/verify` | Verify payment |
| GET | `/payments` | Payment history |
| POST | `/ratings` | Submit rating |
| GET | `/ratings/:questionId` | Get rating for question |

## Expert (`/expert`) — role: `expert`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Expert stats |
| GET | `/questions` | Assigned questions |
| GET | `/questions/:id` | Question detail |
| PATCH | `/questions/:id/start` | Start working |
| POST | `/questions/:id/answer` | Submit answer (multipart) |
| PUT | `/profile` | Update expert profile |
| GET | `/wallet` | Wallet + transactions |
| POST | `/wallet/withdraw` | Request withdrawal |
| GET | `/ratings` | Expert ratings |

## Admin (`/admin`) — role: `admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Admin analytics dashboard |
| GET | `/users` | List users |
| PATCH | `/users/:id/toggle` | Toggle user active status |
| POST | `/experts` | Create expert (multipart photo) |
| GET | `/experts` | List experts |
| PUT | `/experts/:id` | Update expert |
| DELETE | `/experts/:id` | Delete expert |
| POST/GET/PUT/DELETE | `/categories` | Category CRUD |
| GET/POST/PUT/DELETE | `/expert-types` | Expert type CRUD |
| GET | `/questions/pending` | Pending questions |
| GET | `/questions` | All questions |
| POST | `/questions/:id/approve` | Approve question |
| POST | `/questions/:id/reject` | Reject question |
| POST | `/questions/:id/assign` | Manual expert assign |
| GET | `/answers/pending` | Pending answers |
| POST | `/answers/:id/approve` | Approve answer |
| POST | `/answers/:id/reject` | Reject answer |
| GET | `/payments` | All payments |
| GET | `/withdrawals` | Withdrawal requests |
| POST | `/withdrawals/:id/approve` | Approve withdrawal |
| POST | `/withdrawals/:id/reject` | Reject withdrawal |
| POST | `/notifications/send` | Send notification |

## Notifications (`/notifications`) — any authenticated role

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List notifications |
| PATCH | `/read-all` | Mark all read |
| PATCH | `/:id/read` | Mark one read |

## Pagination

List endpoints accept `?page=1&limit=10` where supported. Response includes `pagination: { page, limit, total }`.

## File uploads

Multipart fields use `files` (questions/answers) or `photo` (expert create). Max 5 files, 10MB each, whitelisted MIME types.
