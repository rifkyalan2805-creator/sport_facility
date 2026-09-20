# Image backend API (Express + Prisma). Dipakai Railway maupun Render —
# keduanya memakai Dockerfile ini apa adanya; frontend web/ tidak ikut.
#
# node:20-slim + openssl: Prisma 5 butuh libssl untuk query engine-nya; image
# slim tidak selalu membawanya, dan kegagalannya baru muncul saat runtime.

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Schema disalin sebelum `npm ci` karena postinstall menjalankan prisma generate.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- runtime ----------
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# --ignore-scripts mencegah postinstall (prisma generate) jalan di sini: CLI
# prisma adalah devDependency, tidak ikut --omit=dev. Client hasil generate
# di build stage disalin manual — platform & versi engine-nya identik.
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=build /app/dist ./dist
COPY prisma ./prisma

# Swagger memindai anotasi dari dist/routes/*.js relatif terhadap cwd (/app).
# uploads/ = foto member legacy pra-Supabase; isinya EPHEMERAL di container.
RUN mkdir -p uploads && chown -R node:node /app
USER node

# Railway/Render meng-inject PORT sendiri; nilai ini hanya default lokal.
EXPOSE 3000
CMD ["node", "dist/server.js"]
