# GemVault — Full-Stack Gemstone Marketplace

## Project Structure
```
gem-marketplace/
├── gem-backend/       Node.js + TypeScript + Express + Prisma API
├── gem-forntend/      React 18 + Vite + TypeScript + Tailwind CSS
└── docker-compose.yml
```

## Quick Start (Docker)
```bash
# Copy and fill in your env vars
cp gem-backend/.env.example gem-backend/.env

# Start all services (Postgres, Redis, API, Client)
docker compose up -d
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- API Health: http://localhost:4000/health

## Local Development

### Backend
```bash
cd gem-backend
cp .env.example .env       # fill in values
npm install
npx prisma migrate dev     # run DB migrations
npm run dev                # starts on port 4000
```

### Frontend
```bash
cd gem-forntend
npm install
npm run dev                # starts on port 5173, proxies /api to :4000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL 15 via Prisma ORM |
| Cache | Redis 7 |
| Auth | JWT (access 15m) + Refresh Tokens (7d) |
| File Storage | Cloudinary |
| Real-time | Socket.IO v4 |
| Email | Nodemailer (SMTP) |
| Frontend | React 18 + Vite 5 |
| UI | Tailwind CSS + custom shadcn/ui components |
| State | Zustand (persisted) + TanStack Query v5 |
| Routing | React Router v6 |

## User Roles

| Role | Capabilities |
|------|-------------|
| **Buyer** | Browse gems, reserve (24h), submit valuations |
| **Seller** | List gems (CRUD), submit for review, view bids, select buyer |
| **Admin** | Approve/reject listings, manage users, view dashboard stats |

## API Endpoints

### Auth — `/api/auth`
- `POST /register` — Create account (seller/buyer)
- `POST /login` — Login, returns JWT pair
- `POST /refresh` — Rotate refresh token
- `POST /logout` — Invalidate refresh token
- `POST /verify-email` — Verify email token
- `POST /forgot-password` — Send reset email
- `POST /reset-password` — Set new password
- `GET /me` — Get current user

### Gems — `/api/gems`
- `GET /` — Browse approved gems (filterable, paginated)
- `GET /:id` — Gem detail
- `POST /` — Create listing (seller)
- `PUT /:id` — Update listing (seller)
- `DELETE /:id` — Delete listing (seller)
- `GET /my` — My listings (seller)
- `POST /:id/submit` — Submit for review
- `POST /:id/images` — Upload images
- `DELETE /:id/images/:imageId` — Remove image
- `POST /:id/certificate` — Upload certificate

### Reservations — `/api/reservations`
- `POST /` — Reserve gem (buyer, 24h)
- `DELETE /:id` — Cancel reservation
- `GET /my` — My reservations (buyer)

### Valuations — `/api/gems/:gemId/valuations` & `/api/valuations`
- `POST /gems/:gemId/valuations` — Submit valuation (buyer)
- `GET /gems/:gemId/valuations` — View bids (seller)
- `PUT /valuations/:id/select` — Select winning bid (seller)
- `GET /valuations/my` — My submitted bids (buyer)

### Chat — `/api/chats`
- `GET /` — My chat rooms
- `GET /:roomId/messages` — Get messages (paginated)
- `POST /:roomId/messages` — Send message

### Notifications — `/api/notifications`
- `GET /` — All notifications
- `PUT /read-all` — Mark all read
- `PUT /:id/read` — Mark one read

### Admin — `/api/admin`
- `GET /dashboard` — Stats
- `GET /gems/pending` — Pending review
- `PUT /gems/:id/approve` — Approve gem
- `PUT /gems/:id/reject` — Reject gem
- `GET /users` — All users
- `PATCH /users/:id/toggle-status` — Suspend/activate

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_room` | client→server | `{ roomId }` |
| `send_message` | client→server | `{ roomId, content }` |
| `new_message` | server→client | message object |
| `typing` | client→server | `{ roomId }` |
| `stop_typing` | client→server | `{ roomId }` |
| `user_typing` | server→client | `{ userId, userName }` |
| `notification` | server→client | notification object |
