from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q, Avg
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from decimal import Decimal
import uuid
from .models import Product, Category, Order, OrderItem, Customer, Review, CartItem, Wishlist
from .forms import ProductUploadForm, ProductSearchForm


def home(request):
    """Home page with featured products and search functionality"""
    # Get search parameters
    query = request.GET.get('q', '')
    category_id = request.GET.get('category', '')
    min_price = request.GET.get('min_price', '')
    max_price = request.GET.get('max_price', '')
    
    # Base queryset for available products
    products = Product.objects.filter(status='AVAILABLE').select_related('category')
    
    # Apply filters
    if query:
        products = products.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query) |
            Q(short_description__icontains=query) |
            Q(materials__icontains=query) |
            Q(artisan_name__icontains=query)
        )
    
    if category_id:
        products = products.filter(category_id=category_id)
    
    if min_price:
        try:
            products = products.filter(price__gte=float(min_price))
        except ValueError:
            pass
    
    if max_price:
        try:
            products = products.filter(price__lte=float(max_price))
        except ValueError:
            pass
    
    # Pagination
    paginator = Paginator(products, 9)  # Show 9 products per page
    page_number = request.GET.get('page')
    products_page = paginator.get_page(page_number)
    
    # Get all categories for filter dropdown
    categories = Category.objects.all()
    
    # Featured products
    featured_products = Product.objects.filter(status='AVAILABLE', is_featured=True)[:6]
    
    context = {
        'products': products_page,
        'categories': categories,
        'featured_products': featured_products,
        'query': query,
        'selected_category': category_id,
        'min_price': min_price,
        'max_price': max_price,
    }
    return render(request, 'marketplace/home.html', context)


def product_list(request):
    """Display all available products with filtering options"""
    return home(request)  # Use the same logic as home


def product_detail(request, product_id):
    """Display detailed information about a specific product"""
    product = get_object_or_404(Product, id=product_id)
    
    # Get reviews for this product
    reviews = Review.objects.filter(product=product).select_related('customer__user').order_by('-created_at')
    
    # Calculate average rating
    avg_rating = product.average_rating
    
    # Get related products from same category
    related_products = Product.objects.filter(
        category=product.category, 
        status='AVAILABLE'
    ).exclude(id=product.id)[:4]
    
    # Check if user has this in wishlist
    in_wishlist = False
    if request.user.is_authenticated:
        try:
            customer = Customer.objects.get(user=request.user)
            in_wishlist = Wishlist.objects.filter(customer=customer, product=product).exists()
        except Customer.DoesNotExist:
            pass
    
    context = {
        'product': product,
        'reviews': reviews,
        'avg_rating': avg_rating,
        'review_count': reviews.count(),
        'related_products': related_products,
        'in_wishlist': in_wishlist,
    }
    return render(request, 'marketplace/product_detail.html', context)


@login_required
@require_POST
def add_to_cart(request, product_id):
    """Add product to shopping cart"""
    product = get_object_or_404(Product, id=product_id, status='AVAILABLE')
    quantity = int(request.POST.get('quantity', 1))
    
    if quantity > product.stock_quantity:
        return JsonResponse({
            'success': False, 
            'message': f'Only {product.stock_quantity} items available in stock.'
        })
    
    # Get or create customer profile
    customer, created = Customer.objects.get_or_create(user=request.user)
    
    # Add to cart or update quantity
    cart_item, created = CartItem.objects.get_or_create(
        customer=customer,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        if cart_item.quantity > product.stock_quantity:
            cart_item.quantity = product.stock_quantity
        cart_item.save()
    
    # Get cart count for response
    cart_count = CartItem.objects.filter(customer=customer).count()
    
    return JsonResponse({
        'success': True,
        'message': f'{product.name} added to cart!',
        'cart_count': cart_count
    })


@login_required
def cart_view(request):
    """Display shopping cart"""
    try:
        customer = Customer.objects.get(user=request.user)
        cart_items = CartItem.objects.filter(customer=customer).select_related('product')
    except Customer.DoesNotExist:
        cart_items = []
    
    # Calculate totals
    subtotal = sum(item.total_price for item in cart_items)
    shipping_cost = Decimal('15.00') if subtotal < 100 else Decimal('0.00')
    total = subtotal + shipping_cost
    
    context = {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'total': total,
    }
    return render(request, 'marketplace/cart.html', context)


@login_required
def profile(request):
    """User profile management"""
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        customer = Customer.objects.create(user=request.user)
    
    if request.method == 'POST':
        # Simple form handling - in a real app, use Django forms
        customer.phone_number = request.POST.get('phone_number', '')
        customer.shipping_address = request.POST.get('shipping_address', '')
        customer.billing_address = request.POST.get('billing_address', '')
        customer.preferred_language = request.POST.get('preferred_language', 'en')
        customer.newsletter_subscription = request.POST.get('newsletter_subscription') == 'on'
        
        # Update user info
        request.user.first_name = request.POST.get('first_name', '')
        request.user.last_name = request.POST.get('last_name', '')
        request.user.email = request.POST.get('email', '')
        
        customer.save()
        request.user.save()
        
        messages.success(request, 'Profile updated successfully!')
        return redirect('profile')
    
    context = {
        'customer': customer,
    }
    return render(request, 'marketplace/profile.html', context)


@login_required
def my_orders(request):
    """Display user's order history"""
    try:
        customer = Customer.objects.get(user=request.user)
        orders = Order.objects.filter(customer=customer).prefetch_related('items__product').order_by('-created_at')
    except Customer.DoesNotExist:
        orders = []
    
    context = {
        'orders': orders,
    }
    return render(request, 'marketplace/my_orders.html', context)


@login_required
def order_detail(request, order_id):
    """Display detailed information about a specific order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Check if user owns this order or is staff
    if order.customer.user != request.user and not request.user.is_staff:
        messages.error(request, 'You do not have permission to view this order.')
        return redirect('my_orders')
    
    context = {
        'order': order,
    }
    return render(request, 'marketplace/order_detail.html', context)


@login_required
def wishlist_view(request):
    """Display user's wishlist"""
    try:
        customer = Customer.objects.get(user=request.user)
        wishlist_items = Wishlist.objects.filter(customer=customer).select_related('product')
    except Customer.DoesNotExist:
        wishlist_items = []
    
    context = {
        'wishlist_items': wishlist_items,
    }
    return render(request, 'marketplace/wishlist.html', context)


@login_required
@require_POST
def toggle_wishlist(request, product_id):
    """Add or remove product from wishlist"""
    product = get_object_or_404(Product, id=product_id)
    customer, created = Customer.objects.get_or_create(user=request.user)
    
    wishlist_item, created = Wishlist.objects.get_or_create(
        customer=customer,
        product=product
    )
    
    if not created:
        wishlist_item.delete()
        action = 'removed'
    else:
        action = 'added'
    
    return JsonResponse({
        'success': True,
        'action': action,
        'message': f'{product.name} {action} to/from wishlist!'
    })


def category_view(request, category_id):
    """Display products in a specific category"""
    category = get_object_or_404(Category, id=category_id)
    products = Product.objects.filter(category=category, status='AVAILABLE')
    
    # Pagination
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    products_page = paginator.get_page(page_number)
    
    context = {
        'category': category,
        'products': products_page,
    }
    return render(request, 'marketplace/category.html', context)


def register(request):
    """User registration"""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! Please complete your profile.')
            # Automatically log in the user
            user = authenticate(username=username, password=form.cleaned_data.get('password1'))
            if user:
                login(request, user)
            return redirect('profile')
    else:
        form = UserCreationForm()
    
    context = {
        'form': form,
    }
    return render(request, 'registration/register.html', context)


# Simple checkout view for demo purposes
@login_required
def checkout(request):
    """Simple checkout process"""
    try:
        customer = Customer.objects.get(user=request.user)
        cart_items = CartItem.objects.filter(customer=customer).select_related('product')
    except Customer.DoesNotExist:
        messages.error(request, 'Please complete your profile before placing an order.')
        return redirect('profile')
    
    if not cart_items:
        messages.error(request, 'Your cart is empty.')
        return redirect('cart')
    
    if request.method == 'POST':
        # Calculate totals
        subtotal = sum(item.total_price for item in cart_items)
        shipping_cost = Decimal('15.00') if subtotal < 100 else Decimal('0.00')
        total = subtotal + shipping_cost
        
        # Create order
        order = Order.objects.create(
            customer=customer,
            shipping_address=customer.shipping_address or 'Address not provided',
            billing_address=customer.billing_address or customer.shipping_address or 'Address not provided',
            shipping_method='STANDARD',
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total_amount=total,
            notes=request.POST.get('notes', '')
        )
        
        # Create order items and update stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            # Update product stock
            item.product.stock_quantity -= item.quantity
            if item.product.stock_quantity <= 0:
                item.product.status = 'OUT_OF_STOCK'
            item.product.save()
        
        # Clear cart
        cart_items.delete()
        
        messages.success(request, f'Order #{order.order_number} placed successfully!')
        return redirect('order_detail', order_id=order.id)
    
    # Calculate totals for display
    subtotal = sum(item.total_price for item in cart_items)
    shipping_cost = Decimal('15.00') if subtotal < 100 else Decimal('0.00')
    total = subtotal + shipping_cost
    
    context = {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'total': total,
        'customer': customer,
    }
    return render(request, 'marketplace/checkout.html', context)


@login_required
def product_upload(request):
    """Upload new products to the marketplace"""
    if request.method == 'POST':
        form = ProductUploadForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save()
            messages.success(
                request, 
                f'Product "{product.name}" has been successfully uploaded and is now live on the marketplace!'
            )
            return redirect('product_detail', product_id=product.id)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ProductUploadForm()
    
    # Get some sample products to show what's already been uploaded
    recent_products = Product.objects.filter(status='AVAILABLE').order_by('-created_at')[:6]
    
    context = {
        'form': form,
        'recent_products': recent_products,
        'categories': Category.objects.all(),
    }
    return render(request, 'marketplace/product_upload.html', context)


def search_products(request):
    """Advanced product search with filters"""
    form = ProductSearchForm(request.GET)
    products = Product.objects.filter(status='AVAILABLE').select_related('category')
    
    if form.is_valid():
        # Apply search filters
        query = form.cleaned_data.get('query')
        if query:
            products = products.filter(
                Q(name__icontains=query) | 
                Q(description__icontains=query) |
                Q(short_description__icontains=query) |
                Q(materials__icontains=query) |
                Q(artisan_name__icontains=query) |
                Q(origin_region__icontains=query)
            )
        
        category = form.cleaned_data.get('category')
        if category:
            products = products.filter(category=category)
        
        min_price = form.cleaned_data.get('min_price')
        if min_price:
            products = products.filter(price__gte=min_price)
        
        max_price = form.cleaned_data.get('max_price')
        if max_price:
            products = products.filter(price__lte=max_price)
        
        if form.cleaned_data.get('featured_only'):
            products = products.filter(is_featured=True)
        
        if form.cleaned_data.get('handmade_only'):
            products = products.filter(is_handmade=True)
        
        if form.cleaned_data.get('traditional_only'):
            products = products.filter(is_traditional_design=True)
    
    # Pagination
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    products_page = paginator.get_page(page_number)
    
    context = {
        'form': form,
        'products': products_page,
        'search_performed': bool(request.GET),
    }
    return render(request, 'marketplace/search_results.html', context)
