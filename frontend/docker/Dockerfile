# ================================
# Multi-stage Dockerfile - React Frontend
# ================================
# Stage 1: Build - Compila a aplicação React
# Stage 2: Production - Nginx serve os arquivos estáticos
# ================================

# ============ BUILD STAGE ============
FROM node:20-alpine AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia package*.json PRIMEIRO para cache de dependências
COPY package*.json ./

# Instala dependências
RUN npm install --legacy-peer-deps

# Copia o resto do código
COPY . .

# Copia .env.production para .env (React usa .env no build)
COPY .env.production .env

# Build da aplicação React
RUN npm run build

# ============ PRODUCTION STAGE ============
FROM nginx:1.25-alpine AS production

# Instala curl para health checks
RUN apk add --no-cache curl

# Remove configuração default do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia build da aplicação
COPY --from=builder /app/build /usr/share/nginx/html

# Copia configuração customizada do nginx
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Cria usuário não-root (opcional para nginx)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Expõe porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Inicia nginx
CMD ["nginx", "-g", "daemon off;"]
