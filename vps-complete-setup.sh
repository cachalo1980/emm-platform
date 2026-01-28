#!/bin/bash
set -e

echo "🚀 EMM Platform - Complete VPS Setup"
echo "====================================="

# Verify we're in the right directory
if [ ! -d "/home/manuel/emm-platform" ]; then
    echo "❌ Error: Repository not found. Please clone it first:"
    echo "   cd /home/manuel"
    echo "   git clone https://github.com/cachalo1980/emm-platform.git"
    exit 1
fi

cd /home/manuel/emm-platform/emm-project

# Check if google-key.json exists
if [ ! -f "google-key.json" ]; then
    echo "❌ Error: google-key.json not found!"
    echo "   Please upload it to: /home/manuel/emm-platform/emm-project/"
    exit 1
fi

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
# EMM Platform - Production Environment Configuration
DATABASE_URL=postgresql://admin:admin123@db:5432/emm_db
GOOGLE_APPLICATION_CREDENTIALS=/app/google-key.json
GOOGLE_CLOUD_PROJECT=emm-platform-production
PORT=3001
NODE_ENV=production
WEBHOOK_URL=https://emmoneto.caruao.cloud/webhook
EOF

echo "✅ .env file created"

# Initialize database
echo "🗄️  Starting database..."
docker compose up -d db

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "📊 Initializing database schema..."
docker exec emm_postgres_db psql -U admin -d emm_db -f /docker-entrypoint-initdb.d/schema.sql || echo "Schema already initialized"

# Insert initial tenant
echo "👤 Creating initial tenant..."
docker exec emm_postgres_db psql -U admin -d emm_db -c "INSERT INTO tenants (company_name, google_enterprise_id) VALUES ('FRIONETO', 'pending') ON CONFLICT DO NOTHING;" || echo "Tenant already exists"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure SSL (Cloudflare Tunnel or Certbot)"
echo "2. Start all services: docker compose up -d"
echo "3. Create Enterprise and link it"
