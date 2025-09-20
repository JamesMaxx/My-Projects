from django.core.management.base import BaseCommand
from marketplace.models import Category, Product
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate the database with authentic African cultural products including Masaai necklaces'

    def handle(self, *args, **options):
        self.stdout.write("Creating categories...")
        
        # Create Categories
        categories_data = [
            {
                'name': 'Jewelry & Accessories',
                'description': 'Traditional African jewelry, necklaces, bracelets, and personal adornments',
                'cultural_significance': 'African jewelry serves as symbols of status, spirituality, and cultural identity. Each piece often carries deep meaning related to tribal affiliation, marital status, age, and spiritual beliefs.'
            },
            {
                'name': 'Textiles & Clothing',
                'description': 'Traditional African fabrics, garments, and woven materials',
                'cultural_significance': 'African textiles represent centuries of artistic tradition, with patterns and colors that convey stories, proverbs, and cultural values passed down through generations.'
            },
            {
                'name': 'Art & Sculptures',
                'description': 'Traditional African art, sculptures, masks, and ceremonial objects',
                'cultural_significance': 'African art serves both aesthetic and spiritual purposes, often used in religious ceremonies, storytelling, and preserving ancestral wisdom.'
            },
            {
                'name': 'Musical Instruments',
                'description': 'Traditional African drums, string instruments, and ceremonial music tools',
                'cultural_significance': 'Music is central to African culture, used for communication, celebration, spiritual rituals, and preserving oral traditions across generations.'
            },
            {
                'name': 'Home & Decor',
                'description': 'Traditional African household items, pottery, baskets, and decorative objects',
                'cultural_significance': 'Functional art that reflects daily life and cultural practices, often incorporating symbolic elements that connect families to their heritage.'
            }
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'cultural_significance': cat_data['cultural_significance']
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f"Created category: {category.name}")

        self.stdout.write("Creating products...")

        # Authentic African Products with focus on Masaai necklaces
        products_data = [
            # Masaai Necklaces
            {
                'name': 'Traditional Masaai Beaded Collar Necklace',
                'description': 'Handcrafted traditional Masaai collar necklace featuring intricate beadwork in vibrant colors. Each bead is carefully selected and arranged according to ancient Masaai traditions.',
                'price': Decimal('89.99'),
                'category': 'Jewelry & Accessories',
                'origin_tribe': 'Masaai',
                'cultural_meaning': 'This collar necklace represents the transition from girlhood to womanhood in Masaai culture. The colors and patterns indicate the wearer\'s age group, marital status, and social position within the community.',
                'traditional_use': 'Worn during important ceremonies, coming-of-age rituals, and cultural celebrations. The necklace is also worn in daily life as a symbol of cultural identity and pride.',
                'materials_used': 'Glass beads, cotton thread, natural dyes in traditional colors including red (representing bravery), blue (symbolizing energy), white (peace), and green (health).',
                'is_featured': True,
                'stock_quantity': 15
            },
            {
                'name': 'Masaai Wedding Necklace Set',
                'description': 'Exquisite multi-layered Masaai wedding necklace set, traditionally worn by brides during marriage ceremonies. Features elaborate beadwork and traditional patterns.',
                'price': Decimal('149.99'),
                'category': 'Jewelry & Accessories',
                'origin_tribe': 'Masaai',
                'cultural_meaning': 'This sacred necklace set is worn by Masaai brides and represents fertility, prosperity, and the blessing of ancestors. Each layer has specific significance in the marriage ceremony.',
                'traditional_use': 'Exclusively worn during wedding ceremonies and important family celebrations. The necklace is often passed down from mother to daughter as a family heirloom.',
                'materials_used': 'Premium glass beads, silver accents, leather cord, and blessed elements from Masaai elders. Colors follow strict traditional patterns.',
                'is_featured': True,
                'stock_quantity': 8
            },
            {
                'name': 'Masaai Warrior Beaded Necklace',
                'description': 'Bold geometric beaded necklace traditionally worn by Masaai warriors (morans). Features striking red and black patterns representing strength and courage.',
                'price': Decimal('67.50'),
                'category': 'Jewelry & Accessories',
                'origin_tribe': 'Masaai',
                'cultural_meaning': 'Worn by young Masaai men during their warrior phase, this necklace symbolizes bravery, strength, and readiness to protect the community. The red represents the blood of the lion.',
                'traditional_use': 'Worn during warrior ceremonies, age-set rituals, and when participating in traditional dances. Also worn as everyday attire by morans.',
                'materials_used': 'Traditional red and black glass beads, reinforced cotton thread, and blessed with prayers from Masaai elders.',
                'is_featured': True,
                'stock_quantity': 20
            },
            {
                'name': 'Masaai Children\'s Learning Necklace',
                'description': 'Colorful beaded necklace designed for Masaai children to learn traditional patterns and cultural meanings while wearing beautiful cultural attire.',
                'price': Decimal('34.99'),
                'category': 'Jewelry & Accessories',
                'origin_tribe': 'Masaai',
                'cultural_meaning': 'These necklaces serve as educational tools, teaching children about their cultural heritage through colors, patterns, and traditional meanings embedded in the beadwork.',
                'traditional_use': 'Worn by children during cultural learning sessions, family gatherings, and community celebrations to instill pride in Masaai heritage.',
                'materials_used': 'Child-safe glass beads in educational color combinations, soft cotton thread, and rounded edges for safety.',
                'is_featured': False,
                'stock_quantity': 25
            },
            {
                'name': 'Masaai Elder Wisdom Necklace',
                'description': 'Sophisticated beaded necklace worn by Masaai elders, featuring complex patterns that represent wisdom, experience, and spiritual guidance.',
                'price': Decimal('199.99'),
                'category': 'Jewelry & Accessories',
                'origin_tribe': 'Masaai',
                'cultural_meaning': 'This necklace is reserved for respected elders and spiritual leaders. The intricate patterns tell stories of wisdom, ancestral knowledge, and spiritual connection.',
                'traditional_use': 'Worn during important community decisions, spiritual ceremonies, and when providing guidance to younger generations.',
                'materials_used': 'Rare traditional beads, some dating back generations, combined with natural materials blessed by Masaai spiritual leaders.',
                'is_featured': True,
                'stock_quantity': 5
            },
            
            # Other African Cultural Items
            {
                'name': 'Yoruba Adire Textile',
                'description': 'Authentic Yoruba adire resist-dyed cotton textile featuring traditional indigo patterns and ancient symbols.',
                'price': Decimal('125.00'),
                'category': 'Textiles & Clothing',
                'origin_tribe': 'Yoruba',
                'cultural_meaning': 'Adire textiles represent the artistic heritage of the Yoruba people, with patterns that convey proverbs, historical events, and spiritual beliefs.',
                'traditional_use': 'Used for special occasions, ceremonies, and as gifts to honor important relationships. Also worn as everyday clothing by community members.',
                'materials_used': 'Hand-spun cotton, natural indigo dye, traditional resist techniques using raffia and cassava starch.',
                'is_featured': False,
                'stock_quantity': 12
            },
            {
                'name': 'Akan Kente Cloth Strip',
                'description': 'Handwoven Kente cloth strip from Ghana featuring traditional Akan patterns and gold thread accents.',
                'price': Decimal('189.99'),
                'category': 'Textiles & Clothing',
                'origin_tribe': 'Akan',
                'cultural_meaning': 'Kente is considered sacred cloth that embodies the history, philosophy, and spiritual beliefs of the Akan people. Each pattern has specific meaning.',
                'traditional_use': 'Worn during important ceremonies, festivals, and by people of high social standing. Used in rites of passage and cultural celebrations.',
                'materials_used': 'Hand-spun silk and cotton threads, traditional weaving techniques, natural dyes, and gold metallic threads.',
                'is_featured': True,
                'stock_quantity': 7
            },
            {
                'name': 'Zulu Ceremonial Shield',
                'description': 'Traditional Zulu ceremonial shield crafted using ancestral techniques and decorated with cultural symbols.',
                'price': Decimal('275.00'),
                'category': 'Art & Sculptures',
                'origin_tribe': 'Zulu',
                'cultural_meaning': 'The shield represents protection, honor, and warrior heritage in Zulu culture. Used in ceremonies to honor ancestors and cultural traditions.',
                'traditional_use': 'Used in traditional dances, ceremonies, and cultural performances. Also serves as a decorative item representing Zulu heritage.',
                'materials_used': 'Cowhide, natural pigments, wooden frame, and traditional binding materials. Decorated with authentic Zulu patterns.',
                'is_featured': False,
                'stock_quantity': 4
            }
        ]

        for product_data in products_data:
            category = categories[product_data['category']]
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'description': product_data['description'],
                    'price': product_data['price'],
                    'category': category,
                    'origin_tribe': product_data['origin_tribe'],
                    'cultural_meaning': product_data['cultural_meaning'],
                    'traditional_use': product_data['traditional_use'],
                    'materials_used': product_data['materials_used'],
                    'is_featured': product_data['is_featured'],
                    'stock_quantity': product_data['stock_quantity'],
                    'in_stock': True
                }
            )
            if created:
                self.stdout.write(f"Created product: {product.name}")

        self.stdout.write(
            self.style.SUCCESS(
                'Successfully populated database with authentic African cultural products including Masaai necklaces!'
            )
        )