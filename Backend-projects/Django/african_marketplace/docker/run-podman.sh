#!/bin/bash

# 🐳 African Heritage Marketplace - Simple Podman Launch
# This script builds and runs the marketplace in a single Podman container

echo "🌍 African Heritage Marketplace - Simple Podman Deployment"
echo "======================================================="

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "📁 Working directory: $(pwd)"
echo ""

# Build the image
echo "🔨 Building Podman image..."
podman build -f docker/Dockerfile -t african-marketplace:latest .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Stop any existing container
echo "🛑 Stopping any existing containers..."
podman stop african-marketplace-container 2>/dev/null
podman rm african-marketplace-container 2>/dev/null

echo ""
echo "🚀 Starting African Heritage Marketplace..."
echo "📍 Will be available at: http://localhost:8000"
echo "🔑 Demo login: admin / admin123"
echo ""

# Run the container
podman run -d \
    --name african-marketplace-container \
    -p 8000:8000 \
    -v "$(pwd)/media:/app/media:Z" \
    -v "$(pwd)/db.sqlite3:/app/db.sqlite3:Z" \
    -e DEBUG=1 \
    -e ALLOWED_HOSTS="*" \
    african-marketplace:latest

if [ $? -eq 0 ]; then
    echo "✅ Container started successfully!"
    echo ""
    echo "🌐 Access your marketplace:"
    echo "   Local: http://localhost:8000"
    echo "   Network: http://$(hostname -I | awk '{print $1}'):8000"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: podman logs -f african-marketplace-container"
    echo "   Stop: podman stop african-marketplace-container"
    echo "   Shell access: podman exec -it african-marketplace-container bash"
    echo ""
    echo "🔄 Following container logs (Ctrl+C to stop viewing)..."
    podman logs -f african-marketplace-container
else
    echo "❌ Failed to start container!"
    exit 1
fi