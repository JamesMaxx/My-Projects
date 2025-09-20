#!/usr/bin/env python3
"""
Demo data for African Marketplace featuring authentic Masaai necklaces
Based on research into traditional Masaai beadwork and jewelry
"""

# Authentic Masaai necklace demo data
MASAAI_NECKLACES = [
    {
        'name': 'Traditional Masaai Red Warrior Necklace',
        'description': 'Handcrafted beaded necklace featuring the sacred red color representing strength and courage. This traditional design is worn by Masaai warriors and signifies bravery and leadership within the community. Made with authentic glass beads in the classic Masaai style.',
        'price': 45.00,
        'category': 'Jewelry',
        'artisan_name': 'Mary Nasirian',
        'origin_region': 'Kajiado, Kenya',
        'cultural_meaning': 'Red symbolizes courage, strength, and the blood of the warrior. Traditionally worn during ceremonies and rites of passage.',
        'sku_prefix': 'AFR',
        'is_featured': True,
        'stock_quantity': 15
    },
    {
        'name': 'Masaai Blue Wisdom Collar Necklace',
        'description': 'Stunning traditional collar necklace featuring deep blue beads representing the sky and divine wisdom. This intricate design showcases the sophisticated beadwork skills passed down through generations of Masaai women artisans.',
        'price': 65.00,
        'category': 'Jewelry',
        'artisan_name': 'Grace Sankale',
        'origin_region': 'Amboseli, Kenya',
        'cultural_meaning': 'Blue represents the sky, water, and divine energy. Worn by respected elders and during spiritual ceremonies.',
        'sku_prefix': 'AFR',
        'is_featured': True,
        'stock_quantity': 8
    },
    {
        'name': 'Traditional Black & White Unity Necklace',
        'description': 'Classic Masaai design combining black and white beads in geometric patterns representing balance and unity. This ceremonial piece reflects the duality of nature and the harmony between opposing forces in Masaai philosophy.',
        'price': 38.00,
        'category': 'Jewelry',
        'artisan_name': 'Agnes Parsitau',
        'origin_region': 'Narok, Kenya',
        'cultural_meaning': 'Black and white together represent balance, unity, and the duality of existence in traditional Masaai beliefs.',
        'sku_prefix': 'AFR',
        'is_featured': False,
        'stock_quantity': 12
    },
    {
        'name': 'Masaai Rainbow Spirit Necklace',
        'description': 'Vibrant multi-colored beaded necklace incorporating traditional Masaai colors in a celebration of life and spirit. Each color holds deep cultural significance and tells the story of the Masaai connection to nature and community.',
        'price': 52.00,
        'category': 'Jewelry',
        'artisan_name': 'Josephine Lemoyan',
        'origin_region': 'Arusha, Tanzania',
        'cultural_meaning': 'Multiple colors represent the full spectrum of life experiences, from youth to elderhood, joy to sorrow.',
        'sku_prefix': 'AFR',
        'is_featured': True,
        'stock_quantity': 6
    },
    {
        'name': 'Sacred Red Cow Ceremonial Necklace',
        'description': 'Premium ceremonial necklace inspired by Oodo Mongi, the sacred Red Cow totem of Masaai society. This elaborate piece features intricate beadwork patterns and is reserved for special ceremonies and celebrations.',
        'price': 85.00,
        'category': 'Jewelry',
        'artisan_name': 'Nice Lengete',
        'origin_region': 'Kilimanjaro, Tanzania',
        'cultural_meaning': 'Honors Oodo Mongi, the Red Cow, one of the two sacred pillars of Masaai society representing prosperity and blessing.',
        'sku_prefix': 'AFR',
        'is_featured': True,
        'stock_quantity': 3
    },
    {
        'name': 'Young Warrior Coming of Age Necklace',
        'description': 'Traditional beaded necklace worn during the Eunoto ceremony when young warriors transition to elder status. Features classic red and black patterns that symbolize the journey from warrior to respected community member.',
        'price': 42.00,
        'category': 'Jewelry',
        'artisan_name': 'David Rudisha',
        'origin_region': 'Rift Valley, Kenya',
        'cultural_meaning': 'Worn during Eunoto ceremony marking transition from warrior to elder, representing maturity and wisdom.',
        'sku_prefix': 'AFR',
        'is_featured': False,
        'stock_quantity': 10
    },
    {
        'name': 'Women\'s Wisdom Circle Necklace',
        'description': 'Elegant beaded necklace traditionally crafted and worn by Masaai women. Features intricate patterns that represent the wisdom passed down through generations of mothers and grandmothers in Masaai society.',
        'price': 48.00,
        'category': 'Jewelry',
        'artisan_name': 'Sanaipei Tande',
        'origin_region': 'Laikipia, Kenya',
        'cultural_meaning': 'Represents the wisdom circle of Masaai women and their role as keepers of cultural traditions.',
        'sku_prefix': 'AFR',
        'is_featured': False,
        'stock_quantity': 9
    },
    {
        'name': 'Lion Courage Protection Necklace',
        'description': 'Powerful protection necklace honoring the lion, the totemic animal of the Masaai people. Features bold red and gold beadwork symbolizing the courage and strength needed to face life\'s challenges.',
        'price': 58.00,
        'category': 'Jewelry',
        'artisan_name': 'Jackson Ole Sapit',
        'origin_region': 'Mara, Kenya',
        'cultural_meaning': 'Honors the lion as the Masaai totemic animal, providing protection and courage to the wearer.',
        'sku_prefix': 'AFR',
        'is_featured': True,
        'stock_quantity': 7
    }
]

# Additional categories for the marketplace
CATEGORIES = [
    'Jewelry',
    'Textiles',
    'Art',
    'Clothing',
    'Home Decor',
    'Accessories'
]

def print_demo_data():
    """Print formatted demo data for review"""
    print("African Marketplace - Demo Masaai Necklace Products")
    print("=" * 50)
    
    total_value = 0
    for i, product in enumerate(MASAAI_NECKLACES, 1):
        print(f"\n{i}. {product['name']}")
        print(f"   Price: ${product['price']:.2f}")
        print(f"   Artisan: {product['artisan_name']}")
        print(f"   Region: {product['origin_region']}")
        print(f"   Stock: {product['stock_quantity']} units")
        print(f"   Cultural Meaning: {product['cultural_meaning']}")
        total_value += product['price'] * product['stock_quantity']
    
    print(f"\nTotal Products: {len(MASAAI_NECKLACES)}")
    print(f"Total Inventory Value: ${total_value:.2f}")

if __name__ == "__main__":
    print_demo_data()