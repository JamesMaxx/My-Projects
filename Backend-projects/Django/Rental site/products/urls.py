from django.urls import path
from . import views

from django.urls import path
from . import views

urlpatterns = [
    # Home and product listing
    path('', views.home, name='home'),
    path('products/', views.product_list, name='product_list'),
    path('product/<int:product_id>/', views.product_detail, name='product_detail'),
    
    # Shopping cart and checkout
    path('cart/', views.cart_view, name='cart'),
    path('add-to-cart/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('checkout/', views.checkout, name='checkout'),
    
    # Orders
    path('my-orders/', views.my_orders, name='my_orders'),
    path('order/<int:order_id>/', views.order_detail, name='order_detail'),
    
    # Reviews
    path('add-review/<int:product_id>/', views.add_review, name='add_review'),
    
    # Wishlist
    path('wishlist/', views.wishlist_view, name='wishlist'),
    path('toggle-wishlist/<int:product_id>/', views.toggle_wishlist, name='toggle_wishlist'),
    
    # User management
    path('profile/', views.profile, name='profile'),
    path('register/', views.register, name='register'),
]