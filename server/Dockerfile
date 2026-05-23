FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

# Prisma needs openssl
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 4000

# Deploy: apply schema + seed (idempotent) + start server
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node prisma/seed.js && node src/index.js"]
