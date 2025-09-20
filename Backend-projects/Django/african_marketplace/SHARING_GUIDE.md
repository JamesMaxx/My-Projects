# 🌍 African Heritage Marketplace - Local Network Sharing

## 🚀 Quick Start for Local Network Sharing

Your African Heritage Marketplace is now configured to be shared on your local network!

### 📍 Access URLs

**For you (local machine):**
- http://localhost:8000
- http://127.0.0.1:8000

**For others on your network:**
- **http://172.20.43.79:8000** ← Share this URL with others!

### 🔑 Demo Credentials

- **Username:** `admin`
- **Password:** `admin123`

### 🛠️ How to Start the Server

**Option 1: Use the convenience script**
```bash
cd "/home/jamesmax/My-Projects/Backend-projects/Django/african_marketplace"
./start_local_server.sh
```

**Option 2: Manual command**
```bash
cd "/home/jamesmax/My-Projects/Backend-projects/Django/african_marketplace"
python3 manage.py runserver 0.0.0.0:8000
```

### 📱 Sharing Instructions

1. **Start the server** using one of the methods above
2. **Share this URL** with anyone on your local network: `http://172.20.43.79:8000`
3. **Make sure they're on the same WiFi/network** as your computer
4. **They can access** the marketplace from their phones, tablets, or computers

### 🌟 Features Available for Sharing

- ✅ **Browse Products** - View all authentic African heritage items
- ✅ **Featured Masaai Necklaces** - Beautiful traditional jewelry collection
- ✅ **Product Details** - Rich cultural information for each item
- ✅ **Upload Products** - Add new items (requires login)
- ✅ **Search & Filter** - Find products by category, tribe, or keywords
- ✅ **Mobile Responsive** - Works perfectly on phones and tablets

### 🎯 What Others Can Do

**Without Login:**
- Browse all products
- View detailed product information
- Search and filter items
- Learn about African cultural heritage

**With Login (admin/admin123):**
- Upload new products
- Add cultural significance details
- Manage categories
- Access admin panel

### 🔧 Technical Details

- **Server Configuration:** Accessible on all network interfaces (0.0.0.0:8000)
- **Allowed Hosts:** Set to accept all connections
- **Media Files:** Properly served for image viewing
- **Authentication:** Django built-in system with demo credentials

### 🛑 To Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

### 📝 Notes

- The server only works while your computer is on and connected to the network
- Others need to be on the same local network (WiFi) to access it
- This is a development server - perfect for local sharing and demos
- All data is stored locally on your machine

---

**Enjoy sharing your African Heritage Marketplace! 🎉**