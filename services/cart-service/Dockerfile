# builder
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# runtime
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist

COPY .env .env

EXPOSE 3002
CMD ["node", "dist/index.js"]
