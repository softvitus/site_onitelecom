#!/bin/bash

# Site ONI - Nginx + SSL Setup
# Execute once on server: bash setup-nginx-ssl.sh

set -e

echo "🔧 Site ONI - Nginx + SSL Setup"
echo "=================================="

# Install Nginx and Certbot
echo ""
echo "📦 Installing Nginx and Certbot..."
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# Enable Nginx
systemctl enable nginx
systemctl start nginx

# Create Nginx configuration
echo ""
echo "⚙️  Configuring Nginx..."

cat > /etc/nginx/sites-available/site-oni << 'EOF'
# Frontend - site.onitelecom.com.br
server {
    listen 80;
    server_name site.onitelecom.com.br www.site.onitelecom.com.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}

# Painel - sitepainel.onitelecom.com.br
server {
    listen 80;
    server_name sitepainel.onitelecom.com.br www.sitepainel.onitelecom.com.br;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}

# Backend API - backend.onitelecom.com.br
server {
    listen 80;
    server_name backend.onitelecom.com.br www.backend.onitelecom.com.br;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_redirect off;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/site-oni /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo ""
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload Nginx
systemctl reload nginx
echo "✅ Nginx configured and reloaded"

# Generate SSL certificates with Let's Encrypt
echo ""
echo "🔐 Generating SSL certificates..."
certbot --nginx \
  -d site.onitelecom.com.br \
  -d www.site.onitelecom.com.br \
  -d sitepainel.onitelecom.com.br \
  -d www.sitepainel.onitelecom.com.br \
  -d backend.onitelecom.com.br \
  -d www.backend.onitelecom.com.br \
  --non-interactive \
  --agree-tos \
  -m seu-email@example.com \
  --redirect

# Setup auto-renewal
echo ""
echo "🔄 Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Final report
echo ""
echo "════════════════════════════════════════════════════"
echo "✅ SSL and Nginx setup completed!"
echo "════════════════════════════════════════════════════"
echo ""
echo "🌐 Your sites are now secure and live:"
echo ""
echo "Frontend:  https://site.onitelecom.com.br"
echo "Painel:    https://sitepainel.onitelecom.com.br"
echo "Backend:   https://backend.onitelecom.com.br"
echo ""
echo "📝 Certificate renewal is automatic via certbot timer"
echo ""
echo "If you need to renew certificates manually:"
echo "  certbot renew --non-interactive"
echo ""
