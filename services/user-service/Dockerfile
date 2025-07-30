# builder stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dev deps & build
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# runtime stage
FROM node:18-alpine
WORKDIR /app

# only prod deps
COPY package*.json ./
RUN npm ci --production

# copy compiled
COPY --from=builder /app/dist ./dist

COPY .env .env

# expose port (matches ENV in .env)
EXPOSE 3000
CMD ["node", "dist/index.js"]
