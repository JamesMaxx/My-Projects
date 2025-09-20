from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, Customer, Order, OrderItem, CartItem, Wishlist, Review, Payment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for product categories"""
    list_display = ['name', 'product_count', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin interface for products"""
    list_display = [
        'name', 'category', 'price', 'stock_quantity', 'status', 
        'is_featured', 'is_handmade', 'average_rating', 'created_at'
    ]
    list_filter = [
        'status', 'category', 'is_featured', 'is_handmade', 
        'is_traditional_design', 'origin_region', 'created_at'
    ]
    search_fields = ['name', 'description', 'artisan_name', 'materials', 'sku']
    readonly_fields = ['sku', 'created_at', 'updated_at', 'average_rating', 'review_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'short_description', 'description', 'price')
        }),
        ('African Heritage', {
            'fields': ('artisan_name', 'artisan_story', 'origin_region', 'materials', 
                      'cultural_meaning', 'is_handmade', 'is_traditional_design'),
            'classes': ['collapse']
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'status', 'sku', 'is_featured')
        }),
        ('Product Details', {
            'fields': ('weight_grams', 'dimensions'),
            'classes': ['collapse']
        }),
        ('Images', {
            'fields': ('main_image', 'image_2', 'image_3', 'image_4'),
            'classes': ['collapse']
        }),
        ('Statistics', {
            'fields': ('average_rating', 'review_count', 'created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def average_rating(self, obj):
        rating = obj.average_rating
        if rating > 0:
            stars = '★' * int(rating) + '☆' * (5 - int(rating))
            return format_html(f'{stars} ({rating})')
        return 'No ratings'
    average_rating.short_description = 'Rating'


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    """Admin interface for customers"""
    list_display = [
        'user', 'phone_number', 'preferred_language', 
        'newsletter_subscription', 'order_count', 'created_at'
    ]
    list_filter = ['preferred_language', 'newsletter_subscription', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'phone_number']
    readonly_fields = ['created_at', 'updated_at', 'order_count']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Contact Details', {
            'fields': ('phone_number', 'date_of_birth')
        }),
        ('Addresses', {
            'fields': ('shipping_address', 'billing_address'),
            'classes': ['collapse']
        }),
        ('Preferences', {
            'fields': ('preferred_language', 'newsletter_subscription')
        }),
        ('Statistics', {
            'fields': ('order_count', 'created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def order_count(self, obj):
        return obj.orders.count()
    order_count.short_description = 'Orders'


class OrderItemInline(admin.TabularInline):
    """Inline for order items"""
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']
    
    def total_price(self, obj):
        if obj.id:
            return f"${obj.total_price:.2f}"
        return "-"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin interface for orders"""
    list_display = [
        'order_number', 'customer', 'status', 'total_amount', 
        'item_count', 'shipping_method', 'created_at'
    ]
    list_filter = ['status', 'shipping_method', 'created_at', 'shipped_at']
    search_fields = ['order_number', 'customer__user__username', 'customer__user__email']
    readonly_fields = [
        'order_number', 'created_at', 'updated_at', 
        'item_count', 'shipped_at', 'delivered_at'
    ]
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'customer', 'status')
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'shipping_cost', 'tax_amount', 'total_amount')
        }),
        ('Shipping', {
            'fields': ('shipping_method', 'shipping_address', 'billing_address', 'tracking_number'),
            'classes': ['collapse']
        }),
        ('Special Instructions', {
            'fields': ('notes', 'gift_message'),
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'shipped_at', 'delivered_at'),
            'classes': ['collapse']
        }),
        ('Statistics', {
            'fields': ('item_count',),
            'classes': ['collapse']
        }),
    )
    
    def item_count(self, obj):
        return obj.item_count
    item_count.short_description = 'Items'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin interface for reviews"""
    list_display = [
        'product', 'customer', 'rating_stars', 'title', 
        'would_recommend', 'is_verified_purchase', 'created_at'
    ]
    list_filter = ['rating', 'would_recommend', 'is_verified_purchase', 'created_at']
    search_fields = ['product__name', 'customer__user__username', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    
    def rating_stars(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html(f'{stars} ({obj.rating})')
    rating_stars.short_description = 'Rating'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin interface for payments"""
    list_display = [
        'transaction_id', 'order', 'amount', 'payment_method', 
        'status', 'created_at', 'processed_at'
    ]
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['transaction_id', 'order__order_number']
    readonly_fields = ['created_at', 'processed_at']


# Register the remaining models with basic admin
admin.site.register(CartItem)
admin.site.register(Wishlist)

# Customize admin site headers
admin.site.site_header = 'African Marketplace Administration'
admin.site.site_title = 'African Marketplace Admin'
admin.site.index_title = 'Welcome to African Marketplace Administration'
