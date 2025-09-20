from django.contrib import admin
from .models import Category, Product, Customer, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    list_filter = ['created_at']
    fields = ['name', 'description', 'cultural_significance']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'origin_tribe', 'in_stock', 'is_featured', 'created_at']
    list_filter = ['category', 'origin_tribe', 'in_stock', 'is_featured', 'created_at']
    search_fields = ['name', 'description', 'origin_tribe']
    list_editable = ['price', 'in_stock', 'is_featured']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'price', 'category', 'image')
        }),
        ('African Cultural Heritage', {
            'fields': ('origin_tribe', 'cultural_meaning', 'traditional_use', 'materials_used'),
            'classes': ('collapse',)
        }),
        ('Inventory Management', {
            'fields': ('is_featured', 'in_stock', 'stock_quantity', 'created_by')
        }),
    )


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone']
    search_fields = ['user__username', 'user__email', 'phone']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer__user__username', 'id']
    list_editable = ['status']
    inlines = [OrderItemInline]
    readonly_fields = ['created_at', 'updated_at']
