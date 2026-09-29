# ResQ-Pet Backend - Production Docker image for Render
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies first for better layer caching
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ ./

# Create logs directory
RUN mkdir -p logs

EXPOSE 5000

# Basic container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
