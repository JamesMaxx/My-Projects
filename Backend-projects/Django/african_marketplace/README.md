# 🌍 African Heritage Marketplace

A Django-based marketplace celebrating authentic African cultural heritage through traditional products, with special focus on Masaai necklaces and other cultural treasures.

![African Heritage Marketplace](https://img.shields.io/badge/Django-4.2.18-green) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple) ![African Culture](https://img.shields.io/badge/Culture-African%20Heritage-orange)

## 🎯 Features

### 🔥 Core Functionality
- **Product Showcase**: Browse authentic African cultural products
- **Cultural Heritage**: Rich cultural information for each item including origin tribe, traditional use, and cultural significance
- **Product Upload**: Upload new products with detailed cultural context
- **Search & Filter**: Find products by category, tribe, or keywords
- **Admin Interface**: Comprehensive Django admin for product management

### 🌟 Special Collections
- **Masaai Necklaces**: Featured collection of traditional Masaai beaded jewelry
- **African Textiles**: Yoruba Adire, Akan Kente cloth, and more
- **Traditional Art**: Sculptures, ceremonial items, and cultural artifacts
- **Cultural Categories**: Organized by heritage significance and traditional use

### 🎨 Design & UX
- **African-Themed Design**: Custom color scheme with cultural significance
- **Mobile Responsive**: Works perfectly on all devices
- **Bootstrap 5**: Modern, professional interface
- **Cultural Branding**: Authentic African heritage presentation

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Django 4.2.18
- Pillow (for image handling)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd african_marketplace
```

2. **Install dependencies**
```bash
pip install django pillow
```

3. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Create superuser**
```bash
python manage.py createsuperuser
```

5. **Load demo data**
```bash
python manage.py populate_demo_data
```

6. **Start the server**
```bash
python manage.py runserver
```

### 🌐 Local Network Sharing

To share on your local network:

```bash
./start_local_server.sh
```

Or manually:
```bash
python manage.py runserver 0.0.0.0:8000
```

## 🎭 Demo Data

The marketplace comes with authentic African cultural products:

### 📿 Masaai Necklace Collection
- **Traditional Masaai Beaded Collar Necklace** - Coming-of-age significance
- **Masaai Wedding Necklace Set** - Sacred bridal jewelry
- **Masaai Warrior Beaded Necklace** - Symbol of strength and courage
- **Masaai Children's Learning Necklace** - Educational cultural tool
- **Masaai Elder Wisdom Necklace** - Spiritual leadership symbol

### 🎨 Other Cultural Items
- **Yoruba Adire Textile** - Traditional indigo resist-dyed fabric
- **Akan Kente Cloth Strip** - Sacred Ghanaian weaving
- **Zulu Ceremonial Shield** - Traditional warrior heritage

## 🔑 Demo Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 🏗️ Project Structure

```
african_marketplace/
├── african_marketplace/          # Django project settings
│   ├── settings.py               # Main configuration
│   ├── urls.py                   # URL routing
│   └── wsgi.py                   # WSGI configuration
├── marketplace/                  # Main marketplace app
│   ├── models.py                 # Database models
│   ├── views.py                  # View logic
│   ├── forms.py                  # Django forms
│   ├── admin.py                  # Admin interface
│   ├── urls.py                   # App URL patterns
│   ├── templates/marketplace/    # HTML templates
│   └── management/commands/      # Custom management commands
├── templates/registration/       # Authentication templates
├── media/                        # Uploaded images
├── static/                       # Static files
├── start_local_server.sh         # Network sharing script
├── SHARING_GUIDE.md              # Local network sharing guide
└── requirements.txt              # Python dependencies
```

## 🎨 Cultural Theme

The marketplace uses an authentic African color scheme:

- **African Red** (`#D32F2F`): Representing bravery and strength
- **African Blue** (`#1976D2`): Symbolizing energy and spirit
- **African Orange** (`#FF8F00`): Representing prosperity and warmth
- **African Gold** (`#F57C00`): Sacred and ceremonial significance
- **African Green** (`#388E3C`): Health and harmony with nature

## 🌍 Cultural Significance

This marketplace is designed to:
- **Preserve Heritage**: Document and share African cultural knowledge
- **Support Artisans**: Provide platform for traditional craftspeople
- **Educational Value**: Teach about African cultural diversity
- **Cultural Pride**: Celebrate the richness of African traditions

## 📱 Mobile Experience

The marketplace is fully responsive and provides an excellent mobile experience:
- Touch-friendly navigation
- Optimized image loading
- Mobile-first design approach
- Seamless upload functionality on mobile devices

## 🔒 Security Features

- Django's built-in security features
- CSRF protection
- User authentication system
- Secure file upload handling
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your cultural products or improvements
4. Ensure cultural accuracy and respect
5. Submit a pull request

## 📜 Cultural Guidelines

When adding content:
- Research cultural significance thoroughly
- Respect traditional knowledge and practices
- Include proper attribution to origin communities
- Ensure authentic representation
- Avoid cultural appropriation

## 📞 Support

For questions about:
- **Technical Issues**: Check Django documentation
- **Cultural Content**: Research with respect and authenticity
- **Local Sharing**: See `SHARING_GUIDE.md`

## 🙏 Acknowledgments

- African communities for their rich cultural heritage
- Traditional artisans and craftspeople
- Cultural preservationists and educators
- Django and Bootstrap communities

---

**Built with respect for African heritage and tradition** 🌍✨

*This marketplace celebrates the diversity and richness of African cultures while providing a modern platform for sharing traditional knowledge and products.*