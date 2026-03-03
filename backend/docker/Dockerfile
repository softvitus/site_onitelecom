# Simple single-stage Dockerfile
FROM node:20-alpine

ENV NODE_ENV=development
ENV PORT=3000

# Instala curl para health checks
RUN apk add --no-cache curl

# Define diretório de trabalho
WORKDIR /app

# Copia package*.json PRIMEIRO para instalar dependências
COPY package*.json ./

# Instala dependências
RUN npm install --legacy-peer-deps

# Copia o resto do código
COPY . .

# Remove TODOS os .env* files (segurança - virão apenas do docker-compose.yml/volumes)
RUN find /app -maxdepth 1 -name ".env*" -type f -delete

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Muda para usuário não-root
USER nodejs

# Expõe porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Inicia aplicação
CMD ["npm", "start"]
