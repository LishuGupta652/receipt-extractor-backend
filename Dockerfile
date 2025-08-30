# Use Node.js 20 Alpine as the base image for smaller size
FROM node:20-alpine AS builder

# Install system dependencies needed for Tesseract and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    tesseract-ocr \
    tesseract-ocr-data-eng

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies for runtime
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy the eng.traineddata file if it exists
COPY --chown=nestjs:nodejs eng.traineddata* ./

# Create receipts directory with proper permissions
RUN mkdir -p receipts && chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); const options = {hostname: 'localhost', port: 3000, path: '/', timeout: 2000}; const req = http.request(options, (res) => { if (res.statusCode === 200) process.exit(0); else process.exit(1); }); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["node", "dist/main"]
