# MicroHub – TypeScript Microservices Demo

MicroStream Hub is a hands‑on demo application showcasing a full microservices architecture built with TypeScript, Express, MongoDB, and PostgreSQL. It features:

- **Polyglot Data Stores:**
  - **MongoDB** for user and product services (flexible, document‑oriented).
  - **PostgreSQL** for the cart service (relational with ACID guarantees).

- **Containerized Services:**
  - Each service runs in its own Docker container, orchestrated via Docker Compose.
  - Nginx acts as the reverse‑proxy and API gateway, routing requests to the appropriate microservice.

- **Clean Separation of Concerns:**
  - **Auth & User Service:** Signup, signin, JWT‑based cookie auth.
  - **Product Service:** CRUD for catalog items.
  - **Cart Service:** Secure, session‑aware shopping cart tied to user accounts.

- **Robust Startup & Health‑Checks:**
  - Docker Compose health checks ensure databases are ready before services start.
  - Regex‑based Nginx routing handles endpoints with or without trailing slashes.

- **Tech Stack:**
  - **Language & Frameworks:** TypeScript, Node.js, Express.js
  - **Databases:** MongoDB (Mongoose), PostgreSQL (node‑pg)
  - **DevOps:** Docker, Docker Compose, Nginx
