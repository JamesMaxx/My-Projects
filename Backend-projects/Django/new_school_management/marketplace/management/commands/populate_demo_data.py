"""
Django management command to populate the African marketplace with demo Masaai necklace data
"""
import os
import sys
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from marketplace.models import Category, Product
from decimal import Decimal

# Add the project root to Python path to import demo_data
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from demo_data import MASAAI_NECKLACES, CATEGORIES


class Command(BaseCommand):
    help = 'Populate the marketplace with demo Masaai necklace products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products before adding demo data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing products...')
            Product.objects.all().delete()
            Category.objects.all().delete()

        # Create categories
        self.stdout.write('Creating categories...')
        categories_created = 0
        for category_name in CATEGORIES:
            category, created = Category.objects.get_or_create(
                name=category_name,
                defaults={
                    'description': f'Traditional African {category_name.lower()}'
                }
            )
            if created:
                categories_created += 1
                self.stdout.write(f'  Created category: {category_name}')

        # Get the Jewelry category for our products
        jewelry_category = Category.objects.get(name='Jewelry')

        # Create products
        self.stdout.write('Creating Masaai necklace products...')
        products_created = 0
        
        for product_data in MASAAI_NECKLACES:
            # Generate SKU
            sku = f"{product_data['sku_prefix']}-{Product.objects.count() + 1:04d}"
            
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'description': product_data['description'],
                    'price': Decimal(str(product_data['price'])),
                    'category': jewelry_category,
                    'sku': sku,
                    'stock_quantity': product_data['stock_quantity'],
                    'is_featured': product_data['is_featured'],
                    'artisan_name': product_data['artisan_name'],
                    'origin_region': product_data['origin_region'],
                    'cultural_meaning': product_data['cultural_meaning'],
                    'is_active': True,
                }
            )
            
            if created:
                products_created += 1
                self.stdout.write(f'  Created product: {product.name} (${product.price})')
            else:
                self.stdout.write(f'  Product already exists: {product.name}')

        # Summary
        total_value = sum(Decimal(str(p['price'])) * p['stock_quantity'] for p in MASAAI_NECKLACES)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nDemo data creation completed!\n'
                f'Categories created: {categories_created}\n'
                f'Products created: {products_created}\n'
                f'Total inventory value: ${total_value}\n'
                f'Featured products: {sum(1 for p in MASAAI_NECKLACES if p["is_featured"])}\n'
            )
        )