#!/usr/bin/env python3
"""
Vercel build script for African Heritage Marketplace
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'african_marketplace.settings')
    
    # Ensure we're in Vercel environment
    os.environ['VERCEL'] = '1'
    
    try:
        # Collect static files
        print("Collecting static files...")
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput', '--clear'])
        
        # Run migrations
        print("Running database migrations...")
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        
        print("Build completed successfully!")
        
    except Exception as e:
        print(f"Build failed: {e}")
        sys.exit(1)