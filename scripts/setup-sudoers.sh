#!/bin/bash

# Configure sudo access for deployer user (run once as root)
# This allows deployer to run nginx/certbot setup without password

set -e

echo "🔐 Configuring sudo access for deployer..."

# Check if deployer user exists
if ! id "deployer" &>/dev/null; then
    echo "⚠️  deployer user not found, skipping sudoers setup"
    exit 0
fi

# Check if sudoers file is already configured
if sudo -l -U deployer 2>/dev/null | grep -q "NOPASSWD.*nginx"; then
    echo "✅ Sudoers already configured for deployer"
    exit 0
fi

# Add sudoers entry for deployer (allow running nginx/certbot/apt commands without password)
echo "%deployer ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /bin/systemctl, /usr/sbin/nginx, /usr/bin/certbot, /usr/bin/curl" >> /etc/sudoers.d/deployer-app || true

# Verify sudoers file syntax
visudo -c -f /etc/sudoers.d/deployer-app >/dev/null 2>&1 || {
    echo "❌ Invalid sudoers configuration"
    rm -f /etc/sudoers.d/deployer-app
    exit 1
}

echo "✅ Sudoers configured successfully"
