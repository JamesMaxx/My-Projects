from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, Customer, Order, OrderItem, Payment, Review, Wishlist, CartItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'product_count', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Number of Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'price', 'stock_quantity', 'status', 'is_featured', 'created_at']
    list_filter = ['status', 'category', 'materials', 'is_featured', 'is_handmade']
    search_fields = ['name', 'sku', 'description', 'short_description']
    ordering = ['-created_at']
    list_editable = ['price', 'stock_quantity', 'status', 'is_featured']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'sku', 'category', 'short_description')
        }),
        ('Product Details', {
            'fields': ('description', 'materials', 'origin_region', 'colors', 'dimensions', 'weight')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'stock_quantity', 'status')
        }),
        ('Features & Care', {
            'fields': ('features', 'care_instructions', 'artisan_story'),
            'classes': ('collapse',)
        }),
        ('Media & Marketing', {
            'fields': ('image', 'is_featured', 'is_handmade')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'order_count', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'phone']
    list_filter = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Contact Details', {
            'fields': ('phone', 'shipping_address', 'billing_address')
        }),
        ('Personal Information', {
            'fields': ('date_of_birth',)
        }),
    )
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Customer Name'
    
    def order_count(self, obj):
        return obj.orders.count()
    order_count.short_description = 'Total Orders'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ['payment_date']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'status', 'total_amount', 'shipping_method', 'created_at']
    list_filter = ['status', 'shipping_method', 'created_at']
    search_fields = ['order_number', 'customer__user__first_name', 'customer__user__last_name', 'tracking_number']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'customer', 'status', 'shipping_method')
        }),
        ('Addresses', {
            'fields': ('shipping_address', 'billing_address')
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'shipping_cost', 'tax_amount', 'total_amount')
        }),
        ('Tracking & Notes', {
            'fields': ('tracking_number', 'notes', 'special_instructions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('shipped_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['order_number']
    inlines = [OrderItemInline, PaymentInline]
    
    def customer_name(self, obj):
        return obj.customer.full_name
    customer_name.short_description = 'Customer'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('customer__user')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'product_name', 'quantity', 'price', 'total_price']
    list_filter = ['order__created_at']
    search_fields = ['order__order_number', 'product__name']
    
    def order_number(self, obj):
        return obj.order.order_number
    order_number.short_description = 'Order'
    
    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order_info', 'amount', 'payment_method', 'status', 'payment_date']
    list_filter = ['payment_method', 'status', 'payment_date']
    search_fields = ['order__order_number', 'transaction_id']
    ordering = ['-payment_date']
    date_hierarchy = 'payment_date'
    
    def order_info(self, obj):
        return f"Order #{obj.order.order_number} - {obj.order.customer.full_name}"
    order_info.short_description = 'Order'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('order__customer__user')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'product_name', 'rating_stars', 'title', 'is_verified_purchase', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'created_at']
    search_fields = ['customer__user__first_name', 'customer__user__last_name', 'product__name', 'title']
    ordering = ['-created_at']
    
    def customer_name(self, obj):
        return obj.customer.full_name
    customer_name.short_description = 'Customer'
    
    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'
    
    def rating_stars(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html('<span style="color: #ffa500;">{}</span>', stars)
    rating_stars.short_description = 'Rating'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('customer__user', 'product')


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'product_name', 'added_at']
    list_filter = ['added_at']
    search_fields = ['customer__user__first_name', 'customer__user__last_name', 'product__name']
    ordering = ['-added_at']
    
    def customer_name(self, obj):
        return obj.customer.full_name
    customer_name.short_description = 'Customer'
    
    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['customer_or_session', 'product_name', 'quantity', 'total_price', 'added_at']
    list_filter = ['added_at']
    search_fields = ['customer__user__first_name', 'customer__user__last_name', 'product__name', 'session_key']
    ordering = ['-added_at']
    
    def customer_or_session(self, obj):
        if obj.customer:
            return obj.customer.full_name
        return f"Session: {obj.session_key[:8]}..."
    customer_or_session.short_description = 'Customer/Session'
    
    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'
