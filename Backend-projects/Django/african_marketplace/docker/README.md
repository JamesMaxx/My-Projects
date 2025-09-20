# 🐳 Docker Setup for African Heritage Marketplace

This directory contains Docker configuration files to easily deploy and run the African Heritage Marketplace using containers.

## 📋 Quick Start

### Prerequisites
- Docker installed on your system OR Podman
- Docker Compose installed (or podman-compose)

### 🚀 Launch the Application

**Option 1: Use the launch script (Recommended)**
```bash
cd docker

# For Docker:
./launch.sh

# For Podman:
./launch-podman.sh

# Simple Podman (single container):
./run-podman.sh
```

**Option 2: Manual Docker Compose**
```bash
# For SQLite (simple setup)
docker-compose -f docker/docker-compose.sqlite.yml up --build

# For PostgreSQL (full setup)
docker-compose -f docker/docker-compose.yml up --build
```

## 📁 Docker Files Overview

### Core Files
- **`Dockerfile`** - Development Docker image
- **`Dockerfile.prod`** - Production-ready Docker image with Gunicorn
- **`docker-compose.yml`** - Full setup with PostgreSQL database
- **`docker-compose.sqlite.yml`** - Simple setup with SQLite
- **`launch.sh`** - Interactive launch script
- **`.env.docker`** - Environment variables for Docker

## 🔧 Configuration Options

### Development Setup (SQLite)
- Single container
- SQLite database
- Django development server
- Instant startup
- Perfect for testing and demos

### Production Setup (PostgreSQL)
- Multi-container setup
- PostgreSQL database
- Persistent data storage
- Production-ready configuration

## 🌐 Access URLs

Once running, the marketplace will be available at:
- **Local**: http://localhost:8000
- **Network**: http://YOUR_IP:8000

## 🔑 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📊 Container Details

### Web Container
- **Base Image**: Python 3.11 slim
- **Port**: 8000
- **Volumes**: Media files, database (SQLite mode)
- **Environment**: Development-friendly settings

### Database Container (PostgreSQL mode)
- **Image**: PostgreSQL 15
- **Port**: 5432
- **Database**: `african_marketplace`
- **User**: `marketplace_user`
- **Password**: `marketplace_pass`

## 🔄 Docker Commands

### Build and Run
```bash
# Build the image
docker-compose -f docker/docker-compose.yml build

# Run in background
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop containers
docker-compose -f docker/docker-compose.yml down
```

### Development Commands
```bash
# Access container shell
docker-compose -f docker/docker-compose.yml exec web bash

# Run Django commands
docker-compose -f docker/docker-compose.yml exec web python manage.py shell
docker-compose -f docker/docker-compose.yml exec web python manage.py migrate
docker-compose -f docker/docker-compose.yml exec web python manage.py createsuperuser

# View container status
docker-compose -f docker/docker-compose.yml ps
```

### Data Management
```bash
# Backup database (PostgreSQL)
docker-compose -f docker/docker-compose.yml exec db pg_dump -U marketplace_user african_marketplace > backup.sql

# Restore database (PostgreSQL)
docker-compose -f docker/docker-compose.yml exec -T db psql -U marketplace_user african_marketplace < backup.sql

# Reset demo data
docker-compose -f docker/docker-compose.yml exec web python manage.py populate_demo_data
```

## 🔧 Environment Variables

### Available Environment Variables
- `DEBUG` - Enable/disable debug mode (default: 1)
- `SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `DB_ENGINE` - Database engine (postgresql/sqlite3)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port

### Custom Environment File
Create a `.env` file in the project root:
```env
DEBUG=0
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## 🚀 Production Deployment

### Using Production Dockerfile
```bash
# Build production image
docker build -f docker/Dockerfile.prod -t african-marketplace:prod .

# Run with production settings
docker run -p 8000:8000 --env-file .env african-marketplace:prod
```

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure proper `SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS` to your domain
- [ ] Use PostgreSQL database
- [ ] Configure static file serving
- [ ] Set up SSL/HTTPS
- [ ] Configure logging
- [ ] Set up monitoring

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find and kill process using port 8000
sudo lsof -t -i:8000 | xargs sudo kill -9
```

**Permission issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./media
```

**Database connection issues:**
```bash
# Check database container status
docker-compose -f docker/docker-compose.yml logs db

# Restart database container
docker-compose -f docker/docker-compose.yml restart db
```

**Container build failures:**
```bash
# Clean build with no cache
docker-compose -f docker/docker-compose.yml build --no-cache

# Remove old images
docker system prune -a
```

## 📈 Performance Tips

### Development
- Use SQLite for faster startup
- Mount code directory for live reloading
- Use development server

### Production
- Use PostgreSQL for better performance
- Enable static file caching
- Use Gunicorn with multiple workers
- Configure reverse proxy (Nginx)

## 🔒 Security Notes

- Change default database credentials in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regular security updates for base images
- Scan images for vulnerabilities

## 🤝 Contributing

When adding Docker features:
1. Test both SQLite and PostgreSQL setups
2. Update this documentation
3. Ensure compatibility with existing setup
4. Test production deployment

---

**Need help?** Check the main project README.md or create an issue on GitHub.

🌍 **Enjoy your containerized African Heritage Marketplace!** ✨