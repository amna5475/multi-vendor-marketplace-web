# Multi-vendor marketplace web

Next.js frontend for the [Multi-Vendor Ecommerce API](https://github.com/amna5475/Multi-Vendor-Ecommerce-API). It is the customer storefront, seller console, and admin console for the same marketplace backend.

> Production-oriented marketplace UI built with Next.js, React, TypeScript and Tailwind CSS. Talks to a Node.js + Express + PostgreSQL + Redis API with JWT RBAC.

**Live demo:** [storefront](https://multi-vendor-marketplace-web.vercel.app) · [API docs](https://multi-vendor-ecommerce-api-production.up.railway.app/api-docs)

[![CI](https://github.com/amna5475/multi-vendor-marketplace-web/actions/workflows/ci.yml/badge.svg)](https://github.com/amna5475/multi-vendor-marketplace-web/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amna5475/multi-vendor-marketplace-web&env=API_URL&envDescription=Base%20URL%20of%20the%20marketplace%20API%20including%20/api&envLink=https://github.com/amna5475/Multi-Vendor-Ecommerce-API)

```text
Customer / Seller / Admin
        │
        ▼
   Next.js on Vercel  (this repo)
        │  same-origin /backend/* proxy
        ▼
   Marketplace API
        │
   ┌────┼────┐
   ▼    ▼    ▼
 Postgres Redis Cloudinary
```

The browser never calls the API host directly. Next.js rewrites `/backend/:path*` to `API_URL`, which avoids CORS issues on Vercel.

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
| Hosting | Vercel |
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
| API proxy | http://localhost:3001/backend/health |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |

Register as a customer in the UI. To exercise seller/admin flows, register those roles through `POST /api/auth/register` (Swagger) or promote a user in the database, then sign in here.

## Deploy on Vercel

The Express API cannot run on Vercel. Host the API on Render, Railway, or Fly.io first, then point this app at it.

1. Open [vercel.com/new](https://vercel.com/new) and import `amna5475/multi-vendor-marketplace-web`.
2. Framework Preset: **Next.js** (from `vercel.json`).
3. Set environment variables:

| Name | Example | Scope |
| --- | --- | --- |
| `API_URL` | `https://multi-vendor-ecommerce-api-production.up.railway.app/api` | Production, Preview |
| `NEXT_PUBLIC_API_DOCS_URL` | `https://multi-vendor-ecommerce-api-production.up.railway.app/api-docs` | Production (optional) |
| `NEXT_PUBLIC_API_HEALTH_URL` | `https://multi-vendor-ecommerce-api-production.up.railway.app/api/health` | Production (optional) |

4. Deploy. The production storefront is [multi-vendor-marketplace-web.vercel.app](https://multi-vendor-marketplace-web.vercel.app).

Vercel will rebuild on every push to `main`. GitHub Actions also lint and build on push/PR.

## Project structure

```text
src/
  app/            # storefront, account, seller, admin routes
  components/     # shells, product cards, shared UI
  lib/            # API client, auth, cart, types
vercel.json       # Next.js framework preset
```

## Related repository

Backend: [amna5475/Multi-Vendor-Ecommerce-API](https://github.com/amna5475/Multi-Vendor-Ecommerce-API)
