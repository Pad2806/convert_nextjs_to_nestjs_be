# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy file package để cài chỉ production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy thư mục dist từ builder sang
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]