# Base directory for the build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files ensuring they exist
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
