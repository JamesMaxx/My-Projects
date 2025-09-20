from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Category(models.Model):
    """Product categories like Necklaces, Bracelets, Bags, etc."""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """African products for sale"""
    MATERIAL_CHOICES = [
        ('BEADS', 'Traditional Beads'),
        ('LEATHER', 'Genuine Leather'),
        ('SILVER', 'Silver'),
        ('COPPER', 'Copper'),
        ('WOOD', 'Wood'),
        ('MIXED', 'Mixed Materials'),
    ]
    
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('OUT_OF_STOCK', 'Out of Stock'),
        ('DISCONTINUED', 'Discontinued'),
    ]
    
    # Basic product information
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=20, unique=True, help_text="Product SKU/Code")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    
    # Product details
    description = models.TextField()
    short_description = models.CharField(max_length=200, help_text="Brief product summary")
    materials = models.CharField(max_length=20, choices=MATERIAL_CHOICES)
    origin_region = models.CharField(max_length=100, default="African Regions, Kenya")
    
    # Pricing and inventory
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    stock_quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='AVAILABLE')
    
    # Physical characteristics
    weight = models.DecimalField(max_digits=6, decimal_places=2, help_text="Weight in grams", null=True, blank=True)
    dimensions = models.CharField(max_length=100, blank=True, help_text="L x W x H in cm")
    colors = models.CharField(max_length=100, help_text="Available colors")
    
    # Product media and features
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    features = models.TextField(blank=True, help_text="Special features or cultural significance")
    care_instructions = models.TextField(blank=True, help_text="How to care for the product")
    
    # SEO and metadata
    is_featured = models.BooleanField(default=False, help_text="Display on homepage")
    is_handmade = models.BooleanField(default=True)
    artisan_story = models.TextField(blank=True, help_text="Story about the artisan who made this")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.sku}"
    
    @property
    def is_available(self):
        return self.status == 'AVAILABLE' and self.stock_quantity > 0
    
    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        return 0


class Customer(models.Model):
    """Extended user profile for customers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    shipping_address = models.TextField()
    billing_address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.phone}"
    
    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username


class Order(models.Model):
    """Customer orders"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Payment'),
        ('PAID', 'Paid'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]
    
    SHIPPING_CHOICES = [
        ('STANDARD', 'Standard Shipping (7-14 days)'),
        ('EXPRESS', 'Express Shipping (3-5 days)'),
        ('OVERNIGHT', 'Overnight Shipping (1-2 days)'),
        ('PICKUP', 'Local Pickup'),
    ]
    
    # Order identification
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    
    # Order details
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    shipping_method = models.CharField(max_length=15, choices=SHIPPING_CHOICES, default='STANDARD')
    
    # Addresses
    shipping_address = models.TextField()
    billing_address = models.TextField()
    
    # Financial details
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Tracking and notes
    tracking_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    special_instructions = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.order_number} - {self.customer.full_name}"
    
    def save(self, *args, **kwargs):
        # Generate order number if not exists
        if not self.order_number:
            import uuid
            self.order_number = f"MAS{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Individual items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)  # Price at time of order
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Order #{self.order.order_number}"
    
    @property
    def total_price(self):
        return self.price * self.quantity


class Payment(models.Model):
    """Payment transactions for orders"""
    PAYMENT_METHODS = [
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('PAYPAL', 'PayPal'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('MOBILE_MONEY', 'Mobile Money (M-Pesa)'),
        ('CASH_ON_DELIVERY', 'Cash on Delivery'),
    ]
    
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=15, choices=PAYMENT_STATUS, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Payment #{self.id} - {self.order.order_number} - ${self.amount}"


class Review(models.Model):
    """Customer reviews for products"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    order_item = models.OneToOneField(OrderItem, on_delete=models.CASCADE, related_name='review', null=True, blank=True)
    
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=100)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['customer', 'product']
    
    def __str__(self):
        return f"Review by {self.customer.full_name} - {self.rating}/5 stars"


class Wishlist(models.Model):
    """Customer wishlist for products"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['customer', 'product']
    
    def __str__(self):
        return f"{self.customer.full_name}'s wishlist - {self.product.name}"


class CartItem(models.Model):
    """Shopping cart items (session-based)"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='cart_items', null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name} in cart"
    
    @property
    def total_price(self):
        return self.product.price * self.quantity
