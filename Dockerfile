# SaarthiAI - Production Deployment Image

# Stage 1: Build the frontend SPA
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Final Runtime Image
FROM node:20-slim
WORKDIR /app

# Set Production Environment
ENV NODE_ENV=production
ENV PORT=8080

# Move built frontend assets
COPY --from=builder /app/dist ./dist

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# We still need tsx to run our server.ts logic in an all-in-one container
RUN npm install -g tsx

# Copy source code for the backend
COPY backend ./backend
COPY firebase-applet-config.json ./firebase-applet-config.json

EXPOSE 8080

# Command to start the synchronized behavioral engine
CMD ["tsx", "backend/server.ts"]
