#!/bin/sh
set -e

# Create self-signed certificate if not exists (for development)
if [ ! -f /etc/nginx/ssl/cert.pem ]; then
    echo "Generating self-signed certificate for development..."
    openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem -days 365 -nodes \
        -subj "/C=BR/ST=State/L=City/O=Site Oni/CN=localhost"
    chmod 644 /etc/nginx/ssl/cert.pem
    chmod 644 /etc/nginx/ssl/key.pem
fi

# Log nginx version
echo "Starting Nginx $(nginx -v 2>&1 | cut -d' ' -f3)"

# Execute original entrypoint
exec "$@"
