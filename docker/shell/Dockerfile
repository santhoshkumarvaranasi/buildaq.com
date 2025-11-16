# Multi-stage Docker build for Shell Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY apps/shell ./apps/shell
COPY libs ./libs

# Build the application
RUN npx nx build shell --configuration=production

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/dist/shell /usr/share/nginx/html

# Copy nginx configuration
COPY docker/shell/nginx.conf /etc/nginx/nginx.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]