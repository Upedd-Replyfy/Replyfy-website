# Deployment

## Overview

Deploy the API and SPA separately:

- **API** — Node.js process (port 5000 or `PORT` env)
- **Client** — static files from `client/dist` (Vite build)

## Environment variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes (prod) | `production` |
| `PORT` | No | Default `5000` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access token secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret |
| `CLIENT_URL` | Yes (prod) | Comma-separated allowed origins |
| `CLOUDINARY_*` | For uploads | Cloudinary credentials |
| `RAZORPAY_*` | For payments | Razorpay keys |
| `SMTP_*` | Optional | Email notifications |

Copy from `server/.env.example`.

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Production API base, e.g. `https://api.example.com/api` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key |

In development, leave `VITE_API_URL` unset — Vite proxies `/api` to localhost:5000.

## Build

```bash
# API — no build step
cd server && npm ci --omit=dev && npm start

# Client
cd client && npm ci && npm run build
```

Serve `client/dist` via CDN, Vercel, Netlify, or nginx.

## Reverse proxy (nginx example)

```nginx
server {
  listen 443 ssl;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Set `trust proxy` is already enabled in `app.js`.

## MongoDB

Use MongoDB Atlas or self-hosted replica set. Ensure network access from API host.

## Security checklist (production)

- [ ] Strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] `CLIENT_URL` set to exact frontend origin(s)
- [ ] HTTPS everywhere
- [ ] Razorpay keys in live mode with signature verification
- [ ] Cloudinary upload presets restricted
- [ ] Rate limits appropriate for traffic
- [ ] MongoDB user with least privilege
- [ ] Secrets in platform env vars, not in git

## Process management

Use PM2, systemd, or container orchestration:

```bash
cd server
NODE_ENV=production node server.js
```

## Health monitoring

`GET /api/health` returns `{ success: true, message, timestamp }`.

## Rollback

- API: redeploy previous Node bundle / git tag
- Client: redeploy previous `dist` artifact
- Database: no automatic migrations — schema is Mongoose-driven

## Vercel (client)

`client/vercel.json` may exist for SPA routing. Set `VITE_API_URL` in Vercel project settings.
