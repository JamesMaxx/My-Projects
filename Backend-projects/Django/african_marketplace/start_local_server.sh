#!/bin/bash

# African Heritage Marketplace - Local Network Server
# This script starts the Django server accessible on your local network

echo "🌍 Starting African Heritage Marketplace for Local Network Sharing"
echo "=================================================="

# Get local IP address
LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $(NF-2); exit}')

echo "📍 Your local IP address: $LOCAL_IP"
echo "🌐 Server will be accessible at:"
echo "   Local:   http://localhost:8000"
echo "   Network: http://$LOCAL_IP:8000"
echo ""
echo "📱 Share this with others on your network:"
echo "   http://$LOCAL_IP:8000"
echo ""
echo "🔑 Demo Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Change to project directory
cd "/home/jamesmax/My-Projects/Backend-projects/Django/african_marketplace"

# Start Django development server on all interfaces
python3 manage.py runserver 0.0.0.0:8000