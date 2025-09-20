from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.urls import reverse
import uuid


class Category(models.Model):
    """Product categories for African crafts and jewelry"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    cultural_significance = models.TextField(
        blank=True,
        help_text="Cultural meaning and significance of this category in African tradition"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """African marketplace products - jewelry, crafts, and traditional items"""
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('OUT_OF_STOCK', 'Out of Stock'),
        ('DISCONTINUED', 'Discontinued'),
    ]
    
    # Basic product information
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    short_description = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # African-specific fields
    artisan_name = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Name of the African artisan who created this piece"
    )
    artisan_story = models.TextField(
        blank=True,
        help_text="Story about the artisan and their craft"
    )
    origin_region = models.CharField(
        max_length=100,
        blank=True,
        help_text="African region where this was created (e.g., Kenya, Tanzania, South Africa)"
    )
    materials = models.CharField(
        max_length=200,
        help_text="Traditional materials used (e.g., glass beads, leather, silver wire)"
    )
    cultural_meaning = models.TextField(
        blank=True,
        help_text="Cultural significance and traditional meaning of this item"
    )
    is_handmade = models.BooleanField(default=True)
    is_traditional_design = models.BooleanField(
        default=True,
        help_text="True if this follows traditional African design patterns"
    )
    
    # Inventory and status
    stock_quantity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    sku = models.CharField(max_length=50, unique=True, blank=True)
    
    # Product features
    is_featured = models.BooleanField(default=False)
    weight_grams = models.PositiveIntegerField(blank=True, null=True)
    dimensions = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Dimensions in cm (e.g., 45cm length, 2cm width)"
    )
    
    # Images
    main_image = models.ImageField(upload_to='products/main/', blank=True, null=True)
    image_2 = models.ImageField(upload_to='products/gallery/', blank=True, null=True)
    image_3 = models.ImageField(upload_to='products/gallery/', blank=True, null=True)
    image_4 = models.ImageField(upload_to='products/gallery/', blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Auto-generate SKU if not provided
        if not self.sku:
            self.sku = f"AFR-{self.id or uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('product_detail', kwargs={'product_id': self.id})
    
    @property
    def average_rating(self):
        """Calculate average rating from reviews"""
        reviews = self.reviews.all()
        if reviews:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        return 0
    
    @property
    def review_count(self):
        return self.reviews.count()
    
    @property
    def is_available(self):
        return self.status == 'AVAILABLE' and self.stock_quantity > 0


class Customer(models.Model):
    """Extended user profile for marketplace customers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    
    # Addresses
    shipping_address = models.TextField(blank=True)
    billing_address = models.TextField(blank=True)
    
    # Preferences
    preferred_language = models.CharField(
        max_length=10,
        choices=[
            ('en', 'English'),
            ('sw', 'Swahili'),
            ('afr', 'African'),
        ],
        default='en'
    )
    newsletter_subscription = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"
    
    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username


class Order(models.Model):
    """Customer orders"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Payment'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]
    
    SHIPPING_CHOICES = [
        ('STANDARD', 'Standard Shipping'),
        ('EXPRESS', 'Express Shipping'),
        ('OVERNIGHT', 'Overnight Shipping'),
        ('INTERNATIONAL', 'International Shipping'),
    ]
    
    # Order identification
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    
    # Order details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Shipping information
    shipping_method = models.CharField(max_length=20, choices=SHIPPING_CHOICES, default='STANDARD')
    shipping_address = models.TextField()
    billing_address = models.TextField()
    tracking_number = models.CharField(max_length=100, blank=True)
    
    # Special instructions
    notes = models.TextField(blank=True)
    gift_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs):
        # Auto-generate order number if not provided
        if not self.order_number:
            self.order_number = f"AFR-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)
    
    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    """Individual items within an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    @property
    def total_price(self):
        return self.quantity * self.price


class CartItem(models.Model):
    """Shopping cart items"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['customer', 'product']
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name} in cart"
    
    @property
    def total_price(self):
        return self.quantity * self.product.price


class Wishlist(models.Model):
    """Customer wishlist items"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['customer', 'product']
    
    def __str__(self):
        return f"{self.product.name} in {self.customer.user.username}'s wishlist"


class Review(models.Model):
    """Product reviews from customers"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    
    # Review content
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    would_recommend = models.BooleanField(default=True)
    
    # Review verification
    is_verified_purchase = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['customer', 'product']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rating}★ review by {self.customer.user.username}"


class Payment(models.Model):
    """Payment records for orders"""
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('CREDIT_CARD', 'Credit Card'),
        ('PAYPAL', 'PayPal'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('MOBILE_MONEY', 'Mobile Money (M-Pesa)'),
        ('CASH_ON_DELIVERY', 'Cash on Delivery'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    
    # Payment gateway details
    transaction_id = models.CharField(max_length=100, blank=True)
    gateway_response = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Payment {self.transaction_id or self.id} - {self.status}"
