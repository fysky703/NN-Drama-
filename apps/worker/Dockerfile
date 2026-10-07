# NN Drama browser worker (Playwright)
# Build:  docker build -t nn-drama-worker .
# Run:    docker run -p 8787:8787 --env-file .env nn-drama-worker
#
# This service runs long-lived headless browser jobs. It is intentionally
# separate from Vercel serverless functions.

FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787

# Install dependencies (workspace-aware, but copy only what the worker needs)
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/worker/package.json ./apps/worker/package.json
RUN npm install --omit=dev --ignore-scripts || true

# Playwright browsers are pre-installed in the base image.
COPY packages ./packages
COPY apps/worker ./apps/worker

EXPOSE 8787
CMD ["npx", "tsx", "apps/worker/src/index.ts"]
