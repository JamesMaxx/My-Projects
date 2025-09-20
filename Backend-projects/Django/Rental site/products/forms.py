from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Order, Customer, Review


class OrderForm(forms.ModelForm):
    """Form for placing an order"""
    
    shipping_address = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Enter your complete shipping address...'
        }),
        help_text='Include street address, city, state/region, postal code, and country'
    )
    
    billing_address = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Enter billing address (leave blank to use shipping address)...'
        }),
        required=False,
        help_text='Leave blank to use shipping address for billing'
    )
    
    shipping_method = forms.ChoiceField(
        choices=[
            ('STANDARD', 'Standard Shipping (5-7 business days) - Free over $100'),
            ('EXPRESS', 'Express Shipping (2-3 business days) - $25'),
            ('OVERNIGHT', 'Overnight Shipping (1 business day) - $50'),
            ('INTERNATIONAL', 'International Shipping (10-15 business days) - $75'),
        ],
        widget=forms.Select(attrs={'class': 'form-select'}),
        initial='STANDARD'
    )
    
    notes = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 2,
            'placeholder': 'Special delivery instructions or gift message...'
        }),
        required=False,
        help_text='Any special instructions for delivery'
    )
    
    class Meta:
        model = Order
        fields = ['shipping_address', 'billing_address', 'shipping_method', 'notes']
    
    def clean(self):
        cleaned_data = super().clean()
        billing_address = cleaned_data.get('billing_address')
        shipping_address = cleaned_data.get('shipping_address')
        
        # If no billing address provided, use shipping address
        if not billing_address and shipping_address:
            cleaned_data['billing_address'] = shipping_address
        
        # Calculate shipping cost based on method
        shipping_method = cleaned_data.get('shipping_method', 'STANDARD')
        shipping_costs = {
            'STANDARD': 15.00,
            'EXPRESS': 25.00,
            'OVERNIGHT': 50.00,
            'INTERNATIONAL': 75.00,
        }
        cleaned_data['shipping_cost'] = shipping_costs.get(shipping_method, 15.00)
        
        return cleaned_data


class CustomerForm(forms.ModelForm):
    """Form for customer profile management"""
    
    first_name = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your first name'
        })
    )
    
    last_name = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your last name'
        })
    )
    
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email address'
        })
    )
    
    phone_number = forms.CharField(
        max_length=20,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+1 (555) 123-4567'
        }),
        help_text='Include country code for international numbers'
    )
    
    date_of_birth = forms.DateField(
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        }),
        required=False,
        help_text='Optional - helps us provide age-appropriate recommendations'
    )
    
    shipping_address = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Enter your default shipping address...'
        }),
        help_text='This will be used as default for orders'
    )
    
    billing_address = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Enter your billing address (optional)...'
        }),
        required=False,
        help_text='Leave blank to use shipping address'
    )
    
    class Meta:
        model = Customer
        fields = [
            'phone_number', 'date_of_birth', 'shipping_address', 'billing_address'
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # If we have an instance with a user, populate user fields
        if self.instance and hasattr(self.instance, 'user') and self.instance.user:
            self.fields['first_name'].initial = self.instance.user.first_name
            self.fields['last_name'].initial = self.instance.user.last_name
            self.fields['email'].initial = self.instance.user.email
    
    def save(self, commit=True):
        customer = super().save(commit=False)
        
        # Update user fields if they exist
        if hasattr(customer, 'user') and customer.user:
            customer.user.first_name = self.cleaned_data['first_name']
            customer.user.last_name = self.cleaned_data['last_name']
            customer.user.email = self.cleaned_data['email']
            if commit:
                customer.user.save()
        
        if commit:
            customer.save()
        
        return customer


class ReviewForm(forms.ModelForm):
    """Form for adding product reviews"""
    
    rating = forms.ChoiceField(
        choices=[
            (5, '5 Stars - Excellent'),
            (4, '4 Stars - Very Good'),
            (3, '3 Stars - Good'),
            (2, '2 Stars - Fair'),
            (1, '1 Star - Poor'),
        ],
        widget=forms.Select(attrs={
            'class': 'form-select'
        }),
        help_text='Rate your overall satisfaction with this product'
    )
    
    title = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Summarize your review in a few words...'
        }),
        help_text='Brief title for your review'
    )
    
    comment = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'Share your experience with this product...'
        }),
        help_text='Tell others about the quality, craftsmanship, and your overall experience'
    )
    
    would_recommend = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        }),
        help_text='Would you recommend this product to others?'
    )
    
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment', 'would_recommend']
    
    def clean_rating(self):
        rating = self.cleaned_data.get('rating')
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise forms.ValidationError('Rating must be between 1 and 5 stars.')
        except (ValueError, TypeError):
            raise forms.ValidationError('Please select a valid rating.')
        return rating


class CustomUserCreationForm(UserCreationForm):
    """Enhanced user registration form"""
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email address'
        })
    )
    
    first_name = forms.CharField(
        max_length=150,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your first name'
        })
    )
    
    last_name = forms.CharField(
        max_length=150,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your last name'
        })
    )
    
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Choose a username'
        })
    )
    
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Create a strong password'
        })
    )
    
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm your password'
        })
    )
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password1', 'password2']
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        
        if commit:
            user.save()
        
        return user


class ProductSearchForm(forms.Form):
    """Form for product search and filtering"""
    
    query = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Search for African jewelry, beads, necklaces...'
        })
    )
    
    category = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-select'
        })
    )
    
    min_price = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Min price',
            'step': '0.01'
        })
    )
    
    max_price = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Max price',
            'step': '0.01'
        })
    )
    
    sort_by = forms.ChoiceField(
        choices=[
            ('', 'Best Match'),
            ('price_low', 'Price: Low to High'),
            ('price_high', 'Price: High to Low'),
            ('newest', 'Newest First'),
            ('rating', 'Highest Rated'),
            ('popular', 'Most Popular'),
        ],
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-select'
        })
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Dynamically populate category choices
        from .models import Category
        category_choices = [('', 'All Categories')]
        category_choices.extend([(cat.id, cat.name) for cat in Category.objects.all()])
        self.fields['category'].choices = category_choices