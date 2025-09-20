from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .models import Product, Category
from .forms import ProductUploadForm, CategoryForm


def home(request):
    """Homepage displaying featured products and categories"""
    featured_products = Product.objects.filter(is_featured=True, in_stock=True)[:6]
    categories = Category.objects.all()[:6]
    
    context = {
        'featured_products': featured_products,
        'categories': categories,
    }
    return render(request, 'marketplace/home.html', context)


def products_list(request):
    """Display all products with filtering and pagination"""
    products = Product.objects.filter(in_stock=True).select_related('category')
    
    # Filter by category if specified
    category_id = request.GET.get('category')
    if category_id:
        products = products.filter(category_id=category_id)
    
    # Filter by tribe if specified
    tribe = request.GET.get('tribe')
    if tribe:
        products = products.filter(origin_tribe__icontains=tribe)
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        products = products.filter(
            name__icontains=search_query
        ) | products.filter(
            description__icontains=search_query
        ) | products.filter(
            origin_tribe__icontains=search_query
        )
    
    # Pagination
    paginator = Paginator(products, 12)  # Show 12 products per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    categories = Category.objects.all()
    tribes = Product.objects.values_list('origin_tribe', flat=True).distinct().exclude(origin_tribe='')
    
    context = {
        'page_obj': page_obj,
        'categories': categories,
        'tribes': tribes,
        'current_category': category_id,
        'current_tribe': tribe,
        'search_query': search_query,
    }
    return render(request, 'marketplace/products_list.html', context)


def product_detail(request, product_id):
    """Display detailed view of a single product"""
    product = get_object_or_404(Product, id=product_id, in_stock=True)
    related_products = Product.objects.filter(
        category=product.category,
        in_stock=True
    ).exclude(id=product.id)[:4]
    
    context = {
        'product': product,
        'related_products': related_products,
    }
    return render(request, 'marketplace/product_detail.html', context)


@login_required
def upload_product(request):
    """Upload a new product (requires authentication)"""
    if request.method == 'POST':
        form = ProductUploadForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save(commit=False)
            product.created_by = request.user
            product.save()
            messages.success(request, f'Product "{product.name}" has been uploaded successfully!')
            return redirect('marketplace:product_detail', product_id=product.id)
    else:
        form = ProductUploadForm()
    
    return render(request, 'marketplace/upload_product.html', {'form': form})


@login_required
def add_category(request):
    """Add a new category (requires authentication)"""
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            category = form.save()
            messages.success(request, f'Category "{category.name}" has been created successfully!')
            return redirect('marketplace:upload')
    else:
        form = CategoryForm()
    
    return render(request, 'marketplace/add_category.html', {'form': form})
