# African Heritage Marketplace - Deployment Guide

## 🚀 Quick Start with Docker/Podman

This guide provides multiple deployment options for the African Heritage Marketplace application.

## 📋 Prerequisites

- Docker or Podman installed
- Git (for cloning the repository)
- 8GB+ available disk space
- Network access for downloading dependencies

## 🐳 Container Deployment Options

### Option 1: Simple Docker Run
```bash
# Clone the repository
git clone https://github.com/JamesMaxx/My-Projects.git
cd My-Projects/Backend-projects/Django/african_marketplace

# Build and run with Docker
docker build -f docker/Dockerfile -t african-marketplace .
docker run -p 8000:8000 african-marketplace
```

### Option 2: Podman (Recommended for Linux)
```bash
# Use the provided Podman scripts
chmod +x docker/launch-podman.sh docker/run-podman.sh
./docker/launch-podman.sh
```

### Option 3: Docker Compose with PostgreSQL
```bash
# Full production setup with database
docker-compose -f docker/docker-compose.yml up -d
```

### Option 4: Development with SQLite
```bash
# Lightweight development setup
docker-compose -f docker/docker-compose.sqlite.yml up -d
```

## 🌐 Access the Application

Once deployed, access the marketplace at:
- **Local**: http://localhost:8000
- **Network**: http://YOUR_IP:8000 (configure ALLOWED_HOSTS as needed)

## 📁 Project Structure

```
african_marketplace/
├── docker/                    # Container configuration
│   ├── Dockerfile            # Development container
│   ├── Dockerfile.prod       # Production container
│   ├── docker-compose.yml    # PostgreSQL setup
│   ├── docker-compose.sqlite.yml # SQLite setup
│   ├── launch.sh            # Docker deployment script
│   ├── launch-podman.sh     # Podman deployment script
│   ├── run-podman.sh        # Podman run script
│   └── README.md            # Detailed Docker guide
├── marketplace/              # Django app
├── templates/               # HTML templates
├── static/                  # CSS, JS, images
├── media/                   # User uploads
└── manage.py               # Django management
```

## 🛡️ Security Features

- Production container runs as non-root user
- Static files served efficiently with WhiteNoise
- Environment-based configuration
- Security headers and CSRF protection
- Media file isolation

## 🔧 Configuration

### Environment Variables
Create `.env` file for customization:
```env
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@db:5432/marketplace
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
```

### Database Options
1. **SQLite** (Development): Lightweight, no setup required
2. **PostgreSQL** (Production): Robust, scalable, recommended for production

## 🚦 Health Checks

The application includes built-in health monitoring:
- Container health checks every 30 seconds
- Automatic restart on failure
- Graceful shutdown handling

## 📊 Performance

- **Build Time**: ~3-5 minutes (first build)
- **Memory Usage**: ~200-400MB per container
- **Storage**: ~1.5GB total (including dependencies)
- **Startup Time**: ~10-15 seconds

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild container
docker-compose down
docker-compose up --build -d
```

### Backup and Restore
```bash
# Backup database (PostgreSQL)
docker-compose exec db pg_dump -U user marketplace > backup.sql

# Restore database
docker-compose exec -T db psql -U user marketplace < backup.sql
```

## 🌍 Cultural Heritage Features

The marketplace celebrates African heritage with:
- **Traditional Crafts**: Maasai necklaces, traditional clothing
- **Cultural Colors**: Earth tones, vibrant traditional patterns
- **Authentic Products**: Verified traditional African items
- **Community Focus**: Supporting African artisans and culture

## 📞 Support

For deployment issues or questions:
1. Check the detailed `docker/README.md`
2. Review container logs: `docker logs container-name`
3. Verify network connectivity and ports
4. Ensure sufficient system resources

## 🎯 Production Checklist

Before deploying to production:
- [ ] Set DEBUG=False
- [ ] Configure strong SECRET_KEY
- [ ] Set up PostgreSQL database
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up SSL/HTTPS
- [ ] Configure backup strategy
- [ ] Monitor resource usage
- [ ] Set up logging and monitoring

---

**African Heritage Marketplace** - Celebrating and preserving African cultural traditions through authentic marketplace experiences.