# Implementation Plan - Beergarita Pub Backend + Admin

This implementation plan details the steps to build the Backend + Admin interface for the Beergarita Pub project. The architecture uses a hybrid approach: the public site remains hosted on GitHub Pages, while a VPS-based Node.js + Fastify backend with a PostgreSQL database and an embedded React-based admin panel is served under `/admin`.

---

## User Review Required

> [!IMPORTANT]
> - **Hosting Setup:** The backend is designed to run in a Docker Compose environment (Fastify + Postgres + Adminer) on a VPS with Nginx as a reverse proxy. 
> - **Public Frontend URL:** The public site will be updated to fetch data from `beergarita.com.tr` (or whatever your configured domain is) with a fallback to the static `data.js` content if the API is down.
> - **CORS Origins:** We will allow the GitHub Pages URL (`wakeaweb.github.io`) and the custom domain (`beergarita.com.tr`) to access the public API endpoints.

---

## Open Questions

> [!NOTE]
> None at the moment. We have all the technical details, ports, database schemas, and references in the folder. We will follow the exact order in section 10 of the spec.

---

## Proposed Changes

We will create a new directory `beergarita-backend` parallel to `project` inside the workspace `c:\Users\selim\VibeCoding -Folder\Projects\Beergarita`.

### Component: Backend (Fastify + Postgres + Adminer + Docker Compose)

#### [NEW] [docker-compose.yml](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/docker-compose.yml)
Contains the database (PostgreSQL 16), API server (Node/Fastify), and Adminer configurations.

#### [NEW] [.env.example](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/.env.example)
Example environment file containing database connections, JWT secrets, default admin credentials, and CORS origins.

#### [NEW] [Dockerfile](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/Dockerfile)
Multi-stage build Dockerfile to compile the Admin SPA and run the Node.js Fastify backend.

#### [NEW] [server/package.json](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/package.json)
Node server dependency declaration including Fastify, PG (Postgres client), bcrypt, jsonwebtoken, cors, etc.

#### [NEW] [server/src/db/init.js](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/db/init.js)
Database schema definition, tables initialization, and seed execution scripts (migrating the static `data.js` values to PostgreSQL).

#### [NEW] [server/src/server.js](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/server.js)
Fastify application entry point configuring plugins (CORS, Static file serving, Multipart for image uploads), authentication middlewares, database connections, and routes.

#### [NEW] [server/src/routes/](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/routes/)
- `/api/v1/` routes for public access (venue, menu, events, gallery, reviews).
- `/api/v1/admin/` routes for administrative operations with JWT protection.

### Component: Admin UI (React + Vite SPA)

#### [NEW] [admin-ui/](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/server/src/admin-ui/)
A simple React + Vite SPA nested inside the server directory, compiled during Docker build and served under the `/admin` path. Contains the UI to manage:
- Venue Info (address, phone, hours, social handles).
- Menu (categories, products, product options).
- Events.
- Gallery.
- Reviews (including Google Maps rating overrides).

### Component: Nginx configurations

#### [NEW] [nginx/nginx-init.conf](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/nginx/nginx-init.conf)
HTTP configuration for Certbot SSL challenge and proxy routing.

#### [NEW] [nginx/nginx.conf](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/nginx/nginx.conf)
HTTPS configuration with Let's Encrypt certificates, security headers, and reverse proxy setup.

#### [NEW] [nginx/beergarita-nginx.conf](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/beergarita-backend/nginx/beergarita-nginx.conf)
Host-level Nginx template.

### Component: Public Frontend Integration

#### [MODIFY] [data.js](file:///c:/Users/selim/VibeCoding%20-Folder/Projects/Beergarita/project/data.js)
Update data fetching script to load data from `https://api.beergarita.com.tr/api/v1/...` (or the configured backend API host). Fall back to the existing static JSON/JS structures if the network or API server is unreachable.

---

## Verification Plan

### Automated Tests
- Validate Fastify endpoint responses (GET/POST/PUT) locally.
- Docker build test to ensure React admin UI builds correctly and Fastify Docker image runs.

### Manual Verification
- Access `/admin` route on the local Fastify container to verify authorization redirection and CRUD operations.
- Test CORS headers on `/api/v1` public routes.
- Validate that the public website falls back correctly if the backend is down.
