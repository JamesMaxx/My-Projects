from django import forms
from .models import Product, Category


class ProductUploadForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'category', 'image',
            'origin_tribe', 'cultural_meaning', 'traditional_use', 'materials_used',
            'is_featured', 'stock_quantity'
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter product name (e.g., Masaai Beaded Necklace)'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Describe the product and its significance...'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0',
                'placeholder': '0.00'
            }),
            'category': forms.Select(attrs={
                'class': 'form-select'
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
            'origin_tribe': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Masaai, Yoruba, Zulu, etc.'
            }),
            'cultural_meaning': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Explain the cultural significance and meaning...'
            }),
            'traditional_use': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'How is this item traditionally used?'
            }),
            'materials_used': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'What traditional materials are used? (e.g., beads, leather, wood)'
            }),
            'is_featured': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'stock_quantity': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'value': '1'
            })
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = Category.objects.all()
        self.fields['category'].empty_label = "Select a category"


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'description', 'cultural_significance']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Category name (e.g., Jewelry, Textiles, Art)'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Brief description of this category...'
            }),
            'cultural_significance': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Explain the cultural importance of this category in African heritage...'
            })
        }