# PetGuardian Backend - production image
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Logs directory (winston writes here - see src/utils/logger.js)
RUN mkdir -p logs

EXPOSE 5000

# Basic container-level health check against the API's own health route
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
