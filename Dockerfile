FROM node:20-slim

# Install Chromium and dependencies for Remotion rendering
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-cjk \
    fonts-freefont-ttf \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    ffmpeg \
    curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Remotion
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production
# Use concurrency 1 to stay within 512MB memory
ENV RENDER_CONCURRENCY=1

WORKDIR /app

# Copy package files and install ALL deps (need devDeps for bundling)
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# === PRE-BUNDLE DURING BUILD ===
# This runs webpack at build time (plenty of RAM) instead of runtime (512MB)
RUN node prebundle.mjs

# Create rendered videos directory
RUN mkdir -p rendered

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start server
CMD ["node", "server.mjs"]
