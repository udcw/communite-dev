FROM node:20-alpine AS builder
WORKDIR /app

# Copie tous les fichiers
COPY package*.json ./
COPY . .

# Installe TOUTES les dépendances (pas juste production)
RUN npm ci

# Build l'application
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie le build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]