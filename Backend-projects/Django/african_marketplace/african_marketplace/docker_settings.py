"""
Docker-specific Django settings for African Heritage Marketplace
"""

import os
from .settings import *

# Override settings for Docker deployment
DEBUG = os.environ.get('DEBUG', '1') == '1'

# Security settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-docker-development-key-change-in-production')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# Database configuration
if os.environ.get('DB_ENGINE') == 'django.db.backends.postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'african_marketplace'),
            'USER': os.environ.get('DB_USER', 'marketplace_user'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'marketplace_pass'),
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }

# Static files configuration for Docker
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files configuration for Docker
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Additional middleware for production
if not DEBUG:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    
    # Static files serving
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Logging configuration for Docker
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Cache configuration for production
if not DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.environ.get('REDIS_URL', 'redis://redis:6379/1'),
        }
    }