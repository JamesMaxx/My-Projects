#!/bin/bash

# 🐳 African Heritage Marketplace - Podman Launch Script
# This script builds and launches the marketplace using Podman

echo "🌍 African Heritage Marketplace - Podman Setup"
echo "=============================================="

# Check if Podman is installed
if ! command -v podman &> /dev/null; then
    echo "❌ Podman is not installed. Please install Podman first."
    exit 1
fi

# Check if podman-compose is installed
if ! command -v podman-compose &> /dev/null; then
    echo "⚠️  podman-compose not found. Using docker-compose with podman backend..."
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Neither podman-compose nor docker-compose found."
        echo "   Please install podman-compose or docker-compose"
        exit 1
    fi
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="podman-compose"
fi

echo "✅ Podman is installed"
echo "✅ Using compose command: $COMPOSE_CMD"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "📁 Working directory: $(pwd)"
echo ""

# Ask user which setup they want
echo "Choose your setup:"
echo "1) SQLite (Simple, single container)"
echo "2) PostgreSQL (Full setup with database container)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "🚀 Launching with SQLite..."
        COMPOSE_FILE="docker/docker-compose.sqlite.yml"
        ;;
    2)
        echo "🚀 Launching with PostgreSQL..."
        COMPOSE_FILE="docker/docker-compose.yml"
        ;;
    *)
        echo "❌ Invalid choice. Using SQLite as default."
        COMPOSE_FILE="docker/docker-compose.sqlite.yml"
        ;;
esac

echo ""
echo "🔨 Building Podman image..."
$COMPOSE_CMD -f "$COMPOSE_FILE" build

if [ $? -ne 0 ]; then
    echo "❌ Podman build failed!"
    exit 1
fi

echo ""
echo "🎯 Starting African Heritage Marketplace..."
$COMPOSE_CMD -f "$COMPOSE_FILE" up

echo ""
echo "🛑 Marketplace stopped. To restart, run this script again."