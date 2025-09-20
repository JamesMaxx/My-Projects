from django.urls import path
from . import api_views

app_name = 'api'

urlpatterns = [
    # Categories
    path('categories/', api_views.CategoryListView.as_view(), name='category-list'),
    
    # Products
    path('products/', api_views.ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', api_views.ProductDetailView.as_view(), name='product-detail'),
    path('products/featured/', api_views.FeaturedProductsView.as_view(), name='featured-products'),
    
    # Authentication
    path('auth/register/', api_views.register, name='register'),
    path('auth/login/', api_views.login_view, name='login'),
    path('auth/logout/', api_views.logout_view, name='logout'),
    path('auth/profile/', api_views.user_profile, name='user-profile'),
    path('auth/profile/update/', api_views.update_profile, name='update-profile'),
    
    # Orders
    path('orders/', api_views.OrderListView.as_view(), name='order-list'),
    path('orders/create/', api_views.create_order, name='create-order'),
    path('orders/<int:order_id>/', api_views.order_detail, name='order-detail'),
]