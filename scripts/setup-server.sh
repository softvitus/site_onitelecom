#!/bin/bash

# Site ONI - Server Setup Script
# Execute this script on a fresh Ubuntu 22.04+ server to prepare for deployment

set -e

echo "🔧 Site ONI Server Setup"
echo "======================="
echo ""

# Color outputs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "This script must be run as root"
    exit 1
fi

# Update system packages
echo ""
echo "📦 Updating system packages..."
apt update && apt upgrade -y
print_status "System packages updated"

# Install Docker
echo ""
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_status "Docker installed"
else
    print_warning "Docker already installed"
fi

# Install Docker Compose
echo ""
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
else
    print_warning "Docker Compose already installed"
fi

# Create deployer user
echo ""
echo "👤 Creating deployer user..."
if ! id -u deployer &> /dev/null; then
    useradd -m -s /bin/bash deployer
    usermod -aG docker deployer
    print_status "Deployer user created"
else
    print_warning "Deployer user already exists"
fi

# Create application directories
echo ""
echo "📁 Creating application directories..."
mkdir -p /app/site-oni/{data,logs,backups}
chown -R deployer:deployer /app/site-oni
chmod 755 /app/site-oni
print_status "Application directories created"

# Setup SSH for GitHub Actions
echo ""
echo "🔐 Setting up SSH for GitHub Actions..."
sudo -u deployer mkdir -p /home/deployer/.ssh

if [ ! -f /home/deployer/.ssh/github-actions ]; then
    sudo -u deployer ssh-keygen -t ed25519 -f /home/deployer/.ssh/github-actions -N ""
    sudo -u deployer cat /home/deployer/.ssh/github-actions.pub >> /home/deployer/.ssh/authorized_keys
    sudo -u deployer chmod 600 /home/deployer/.ssh/authorized_keys
    sudo -u deployer chmod 700 /home/deployer/.ssh
    print_status "SSH key generated for GitHub Actions"
    echo ""
    echo "📋 Copy this SSH key to GitHub Secrets (DEPLOY_SSH_KEY):"
    echo "════════════════════════════════════════════════════════"
    sudo -u deployer cat /home/deployer/.ssh/github-actions
    echo "════════════════════════════════════════════════════════"
else
    print_warning "SSH key already exists"
fi

# Setup PostgreSQL (optional)
echo ""
read -p "Do you want to install PostgreSQL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v psql &> /dev/null; then
        apt install -y postgresql postgresql-contrib
        systemctl start postgresql
        systemctl enable postgresql
        print_status "PostgreSQL installed"
    else
        print_warning "PostgreSQL already installed"
    fi
fi

# Setup Nginx (optional, for reverse proxy)
echo ""
read -p "Do you want to install Nginx for reverse proxy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
        print_status "Nginx installed"
    else
        print_warning "Nginx already installed"
    fi
fi

# Verify installations
echo ""
echo "✅ Verifying installations..."
docker --version && print_status "Docker $(docker --version | cut -d' ' -f3)"
docker-compose --version && print_status "Docker Compose $(docker-compose --version | cut -d' ' -f3)"

# Final instructions
echo ""
echo "════════════════════════════════════════════════════════"
echo "🎉 Server setup completed!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📝 Next steps:"
echo "1. Copy the SSH key above to GitHub Secrets:"
echo "   - Repository → Settings → Secrets → New secret"
echo "   - Name: DEPLOY_SSH_KEY"
echo "   - Value: (paste the SSH key)"
echo ""
echo "2. Add these secrets to GitHub:"
echo "   - DEPLOY_HOST: $(hostname -I | awk '{print $1}')"
echo "   - DEPLOY_USER: deployer"
echo "   - DEPLOY_PORT: 22"
echo ""
echo "3. Create /app/site-oni/.env.production with:"
echo "   - Database credentials"
echo "   - JWT_SECRET"
echo "   - API configuration"
echo ""
echo "4. Commit changes to main branch:"
echo "   - When pipeline passes, auto-deployment will trigger!"
echo ""
echo "📚 Documentation:"
echo "   - Docker: https://docs.docker.com/"
echo "   - GitHub Actions: https://docs.github.com/actions"
echo ""
