#!/bin/bash

# Build script for Vercel deployment
echo "Starting build process..."

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create staticfiles directory
echo "Creating static files directory..."
mkdir -p staticfiles_build/static

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Copy static files to build directory
echo "Copying static files to build directory..."
cp -r staticfiles/* staticfiles_build/static/ || true

# Create media directory
echo "Creating media directory..."
mkdir -p staticfiles_build/media

echo "Build process completed successfully!"