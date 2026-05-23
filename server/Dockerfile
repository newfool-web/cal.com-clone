FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Prisma needs openssl + libc6-compat on Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 4000

# Deploy: apply schema + seed (idempotent) + start server
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node prisma/seed.js && node src/index.js"]
