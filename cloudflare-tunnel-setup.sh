#!/bin/bash
set -e

echo "🌐 Cloudflare Tunnel Setup for EMM Platform"
echo "============================================"

# Install cloudflared
echo "📥 Installing cloudflared..."
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
rm cloudflared.deb

echo ""
echo "✅ cloudflared installed successfully!"
echo ""
echo "Next steps:"
echo "1. Authenticate with Cloudflare:"
echo "   cloudflared tunnel login"
echo ""
echo "2. Create a tunnel:"
echo "   cloudflared tunnel create emm-platform"
echo ""
echo "3. Configure the tunnel (I'll provide the config file)"
echo ""
echo "4. Route the domain:"
echo "   cloudflared tunnel route dns emm-platform emmoneto.caruao.cloud"
echo ""
echo "5. Start the tunnel as a service"
