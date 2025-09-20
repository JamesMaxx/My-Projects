#!/bin/bash

# 🐳 African Heritage Marketplace - Docker Launch Script
# This script builds and launches the marketplace using Docker

echo "🌍 African Heritage Marketplace - Docker Setup"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
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
echo "🔨 Building Docker image..."
docker-compose -f "$COMPOSE_FILE" build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo ""
echo "🎯 Starting African Heritage Marketplace..."
docker-compose -f "$COMPOSE_FILE" up

echo ""
echo "🛑 Marketplace stopped. To restart, run this script again."