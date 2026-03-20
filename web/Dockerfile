# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build the Next.js app ──────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (non-secret NEXT_PUBLIC_* values baked into the bundle)
ARG NEXT_PUBLIC_API_URL=https://api.basantmahato.in
ARG NEXT_PUBLIC_APP_URL=https://web.basantmahato.in
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=1018549727024-qd9g8a7mt77niinppquu2q6ulvho6e73.apps.googleusercontent.com

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

RUN pnpm build

# ─── Stage 3: Production runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copy the standalone output (Next.js standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

# API_PROXY_TARGET is a runtime env var — set it in Dokploy environment settings
# ENV API_PROXY_TARGET=http://your-api-host:3000

CMD ["node", "server.js"]
