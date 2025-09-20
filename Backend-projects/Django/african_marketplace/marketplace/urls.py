from django.urls import path
from . import views

app_name = 'marketplace'

urlpatterns = [
    path('', views.home, name='home'),
    path('products/', views.products_list, name='products'),
    path('product/<int:product_id>/', views.product_detail, name='product_detail'),
    path('upload/', views.upload_product, name='upload'),
    path('add-category/', views.add_category, name='add_category'),
]