# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Lebih cepat build dengan cache layer khusus dependency
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build ke dist/
RUN npm run build

# ---------- Runner (production) ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Hanya ambil deps production
COPY package*.json ./
RUN npm ci --omit=dev

# Copy hasil build + file yang diperlukan
COPY --from=builder /app/dist ./dist
COPY .env.local ./.env.local

# Expose port
EXPOSE 4000

# Jalankan app (sesuaikan entry kamu, biasanya dist/app.js atau dist/server.js)
CMD ["node", "--enable-source-maps", "dist/app.js"]
