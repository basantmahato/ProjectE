# syntax=docker/dockerfile:1.4
# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# VITE_ vars are baked into the static bundle at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# ─── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing + caching — keep in sync with nginx.conf (inlined because nginx.conf is in .dockerignore)
RUN <<'EOF' cat > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — all routes served by index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
