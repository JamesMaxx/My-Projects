# African Heritage Marketplace - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

This guide will help you deploy the African Heritage Marketplace to Vercel using your connected GitHub repository.

## ✅ Prerequisites

- [x] GitHub account connected to Vercel
- [x] African Heritage Marketplace repository on GitHub
- [x] Vercel account (free tier supported)

## 📋 Deployment Steps

### 1. Import Project to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import from GitHub**: Select your `My-Projects` repository
4. **Choose Framework**: Vercel should auto-detect "Other" or "Static"
5. **Root Directory**: Set to `Backend-projects/Django/african_marketplace/`

### 2. Configure Environment Variables

In the Vercel project settings, add these environment variables:

```env
# Required Environment Variables
SECRET_KEY=your-super-secret-key-here
DEBUG=False
VERCEL=1

# Optional Database (Vercel provides free PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Optional for custom domain
ALLOWED_HOSTS=your-domain.com,your-project.vercel.app
```

### 3. Deploy Settings

**Build Command**: `python manage.py collectstatic --noinput`
**Output Directory**: `staticfiles_build`
**Install Command**: `pip install -r requirements.txt`
**Development Command**: `python manage.py runserver`

## 🔧 Environment Variables Details

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key for security | `django-insecure-xyz123...` |
| `DEBUG` | Set to False for production | `False` |
| `VERCEL` | Enables Vercel-specific settings | `1` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | SQLite (local) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `.vercel.app,.now.sh` |

## 📊 Database Options

### Option 1: Vercel PostgreSQL (Recommended)
1. Go to Vercel Dashboard → Storage
2. Create PostgreSQL database
3. Copy connection string to `DATABASE_URL`

### Option 2: External Database
- Use any PostgreSQL provider (Supabase, Railway, etc.)
- Add connection string to `DATABASE_URL`

### Option 3: SQLite (Development Only)
- No additional setup required
- Data will reset on each deployment

## 🌍 Static Files & Media

### Static Files (CSS, JS, Images)
- ✅ Automatically served by Vercel CDN
- ✅ Compressed and optimized
- ✅ Global edge caching

### Media Files (User Uploads)
- ⚠️ **Note**: Vercel has read-only filesystem
- 📁 For production, use external storage:
  - AWS S3
  - Cloudinary
  - Vercel Blob

## 🔥 Post-Deployment Steps

### 1. Run Database Migrations
```bash
# In Vercel dashboard, go to Functions tab
# Or use Vercel CLI:
vercel env pull
python manage.py migrate
```

### 2. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 3. Populate Demo Data (Optional)
```bash
python manage.py populate_demo_data
```

## 🚀 One-Click Deploy Button

Add this to your GitHub README for easy deployment:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JamesMaxx/My-Projects&project-name=african-marketplace&repository-name=african-marketplace&root-directory=Backend-projects/Django/african_marketplace)
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**: Check requirements.txt has all dependencies
2. **Static Files Not Loading**: Ensure WhiteNoise is in MIDDLEWARE
3. **Database Errors**: Verify DATABASE_URL format
4. **Permission Errors**: Check SECRET_KEY is set

### Debug Commands

```bash
# Check build logs in Vercel dashboard
# Test locally with Vercel CLI:
vercel dev

# Check environment variables:
vercel env list
```

## 📈 Performance Optimization

### Automatic Features
- ✅ Global CDN for static files
- ✅ Serverless function scaling
- ✅ Automatic compression
- ✅ Edge caching

### Recommended Additions
- Use Vercel Analytics
- Enable Vercel Speed Insights
- Configure custom caching headers

## 🛡️ Security Features

### Built-in Security
- HTTPS by default
- DDoS protection
- Automatic security headers

### Django Security Settings
- CSRF protection enabled
- Secure cookies in production
- XSS protection headers

## 📱 Mobile Optimization

The marketplace is mobile-responsive with:
- Bootstrap 5 responsive design
- Optimized images via Pillow
- Touch-friendly interface

## 🌍 Global Deployment

Vercel automatically deploys to:
- **Primary**: Closest to your users
- **Edge**: 100+ global locations
- **Serverless**: Auto-scaling functions

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Django on Vercel**: https://vercel.com/guides/deploying-django-with-vercel
- **Project Repository**: https://github.com/JamesMaxx/My-Projects

## 🎯 Production Checklist

Before going live:
- [ ] Set strong SECRET_KEY
- [ ] Configure production database
- [ ] Set up external media storage
- [ ] Configure custom domain
- [ ] Enable Vercel Analytics
- [ ] Test all functionality
- [ ] Set up monitoring

---

**Ready to Deploy?** Your African Heritage Marketplace is Vercel-ready! 🚀

Just click "Deploy" in your Vercel dashboard!