# Finance Manager — MEAN stack

This folder is for a Finance Manager web application built with the MEAN stack (MongoDB, Express, Angular, Node). The app manages wallets and accounts, assigns a purpose to each wallet, records transactions, and provides basic reports.

Below is a MEAN-focused README that explains how to deploy the Angular frontend to Vercel and recommended options for hosting the Express + MongoDB backend.

## Summary

- Goal: Deploy a Finance Manager UI to Vercel while running a compatible backend for APIs and database.
- Key constraint: Vercel is ideal for static and serverless frontend hosting (Angular is fine). Vercel is not suitable for long-running server processes — host Express/Node elsewhere (or refactor to serverless functions).

Recommended deployment pattern:
- Frontend (Angular): deployed to Vercel as a static site (Angular build output served by Vercel).
- Backend (Express + Node): host on Render / Railway / Fly / Heroku / DigitalOcean App Platform (supports long-running Node servers) or convert APIs into Vercel Serverless Functions (with caveats).
- Database: MongoDB Atlas (managed MongoDB) or any hosted MongoDB provider.

## Why this split

- Vercel excels at delivering static and server-rendered frontend assets and serverless endpoints.
- Express servers are long-running processes and are better hosted on a provider built for persistent Node servers (Render, Railway, Fly). These providers also make it easy to set environment variables and persistent connections to MongoDB Atlas.

## Architecture options

1) Recommended — Angular on Vercel, Express on Render/Railway, MongoDB Atlas
	- Pros: clear separation, predictable connection behavior to MongoDB Atlas, easy CI/CD.
	- Cons: two deployment targets.

2) Angular on Vercel, Express converted to serverless functions on Vercel
	- Pros: single provider, automatic scaling, simpler routing.
	- Cons: cold-starts, connection management to MongoDB (use MongoDB Atlas with serverless-friendly configuration or a connection pool helper). Some Express middleware might need adaptation.

3) Monolithic host (both frontend and backend on Render/Railway)
	- Pros: single host for both; simpler networking for DB and backend.
	- Cons: you won't benefit from Vercel's global CDN optimizations for the static frontend.

## Expected features

- Wallets: name, purpose, currency, owner
- Accounts within wallets: type (income/expense/savings), balance
- Transactions: amount, date, category, tags, notes, linked account
- Reports: balance per wallet, monthly spending by category
- Auth: JWT-based auth or session-based auth (recommended: JWT for SPA)

## Example MongoDB schemas (conceptual)

- User: { _id, email, name, passwordHash, createdAt }
- Wallet: { _id, userId, name, purpose, currency, createdAt }
- Account: { _id, walletId, name, type, balance }
- Transaction: { _id, accountId, walletId, amount, type, category, date, notes }

## Getting started (local development — monorepo layout suggestion)

Suggested repo layout:

- /client  — Angular app
- /server  — Express API

1) Install global tools (if not installed)

```bash
npm install -g @angular/cli
```

2) Install dependencies

```bash
# from repo root
cd client && npm install
cd ../server && npm install
```

3) Environment variables (server)

Create `.env` inside `/server` with at least:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/finance-db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PORT=4000
CLIENT_URL=http://localhost:4200
```

4) Run locally (dev)

```bash
# Start server (with nodemon recommended)
cd server
npm run dev

# Start Angular dev server
cd ../client
ng serve
```

Open Angular at http://localhost:4200 and the API at http://localhost:4000 (or configured port).

## Build frontend for production (Angular)

```bash
cd client
ng build --configuration production
# output goes to client/dist/<project-name>
```

## Deploy frontend to Vercel (Angular)

1. Connect your Git repository to Vercel (Dashboard -> New Project).
2. Set the Framework Preset to "Other" or let Vercel detect Angular; configure these if needed:
	- Build Command: npm run build --prefix client --if-present  (or: cd client && npm run build)
	- Output Directory: client/dist/<your-angular-project-folder>
3. Add any environment variables that the frontend needs (public-only values prefixed NEXT_PUBLIC_ or similar).
4. Deploy — Vercel will build and serve the static files from the dist folder.

Notes:
- If you keep the frontend and backend in a single repo, Vercel will still only deploy the frontend when configured to do so (see Build Command and Output Directory).
- For client-side API calls, ensure the frontend calls the backend URL (set at build time or via runtime env varaibles on Vercel).

## Deploy backend (Express + Node)

# Finance Manager (MEAN monorepo)

Prototype MEAN monorepo scaffold for the Finance Manager app (Angular frontend, Express backend, MongoDB). This scaffold targets:

- Frontend: Angular app (deploy frontend static build to Vercel)
- Backend: Express + Mongoose (can run locally or be adapted to Vercel serverless functions)
- Database: MongoDB (local Docker for dev; you can switch to self-hosted Atlas in prod)
- Auth: JWT
- Uploads: placeholder (connect to S3/Cloud storage in production)

## Repo layout

- /client — Angular frontend (placeholder)
- /server — Express server, models, controllers, routes
- /api — Vercel serverless function wrappers (example handlers)
- docker-compose.yml — runs local MongoDB

## Quickstart (local, prototype)

1. Start MongoDB with Docker Compose

```bash
docker compose up -d
```

2. Start server

```bash
cd server
npm install
cp .env.example .env
# edit .env if needed
npm run dev
```

3. Scaffold or run frontend

- Generate an Angular app inside `/client` using Angular CLI (recommended):

```bash
npx @angular/cli@16 new client --directory client --routing --style=css
cd client
npm install
npm run dev
```

- Or use the placeholder build commands in `/client/package.json` once you have a built `dist` folder.

## Vercel deployment notes

- Frontend: configure Vercel to build the Angular app with `npm run build --prefix client` and output directory `client/dist/<project-name>`.
- Serverless API: copy or use the `/api` folder as Vercel Serverless Functions. Ensure `MONGODB_URI` and `JWT_SECRET` are set in Vercel environment variables.
- Alternatively, deploy `/server` as a persistent service on Render/Railway if you prefer a long-running server.

## Next steps I will implement on request

- Flesh out full Angular UI scaffold and simple views (Wallet list, Wallet detail, Add transaction, Upload receipt).
- Wire server uploads to S3 (using env vars in `.env`).
- Add tests and CI workflow.

If you want me to scaffold the full prototype now (Angular + Express wired, S3 placeholder, Docker dev), say "scaffold monorepo now" and I will continue.

