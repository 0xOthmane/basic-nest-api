## App Overview

This repository contains a NestJS API built with Prisma and PostgreSQL. The app exposes a basic user resource and uses Prisma migrations and a generated client to talk to the database.

## Environment Setup

Copy the example environment file before running the app:

```bash
cp .env.example .env
```

## How to Run

### With Docker

```bash
docker compose up --build
```

This starts PostgreSQL, runs Prisma migrations, and launches the API on port `3000`.

### Locally

```bash
cd basic-api
npm install
npm run build
npm run start:dev
```

Make sure `DATABASE_URL` points to a running PostgreSQL instance before starting the app.

