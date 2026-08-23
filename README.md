# Multi-vendor marketplace web

Next.js frontend for the [Multi-Vendor Ecommerce API](https://github.com/amna5475/Multi-Vendor-Ecommerce-API). It is the customer storefront, seller console, and admin console for the same marketplace backend.

> Production-oriented marketplace UI built with Next.js, React, TypeScript and Tailwind CSS. Talks to a Node.js + Express + PostgreSQL + Redis API with JWT RBAC.

```text
Customer / Seller / Admin
        │
        ▼
   Next.js (this repo)
        │  REST + JWT
        ▼
   Marketplace API
        │
   ┌────┼────┐
   ▼    ▼    ▼
 Postgres Redis Cloudinary
```

## What this demonstrates

Role-based product architecture, not a single CRUD screen:

| Surface | You can do |
| --- | --- |
| **Customer** | Register/login, browse catalog, product detail, cart, checkout, orders, returns, reviews, wallet, apply to sell |
| **Seller** | Shop overview, listings, inventory adjustments, shop orders, settlements |
| **Admin** | Approve/reject sellers, categories/brands, campaigns, payout records, audit logs |

The cart is stored in the browser on purpose: the API has no cart resource. Checkout sends line items to `POST /api/orders`, which decrements inventory in a database transaction.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| Auth | JWT from the API, stored client-side |
| API | Express marketplace backend |

## Run locally

1. Start the API on port 3000 (`docker compose up` in [Multi-Vendor-Ecommerce-API](https://github.com/amna5475/Multi-Vendor-Ecommerce-API)).
2. Seed categories/brands: `node scripts/seed.js` in the API repo.
3. In this repo:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

| App | URL |
| --- | --- |
| Storefront | http://localhost:3001 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |

Register as a customer in the UI. To exercise seller/admin flows, register those roles through `POST /api/auth/register` (Swagger) or promote a user in the database, then sign in here.

## Project structure

```text
src/
  app/            # storefront, account, seller, admin routes
  components/     # shells, product cards, shared UI
  lib/            # API client, auth, cart, types
```

## Related repository

Backend: [amna5475/Multi-Vendor-Ecommerce-API](https://github.com/amna5475/Multi-Vendor-Ecommerce-API)
