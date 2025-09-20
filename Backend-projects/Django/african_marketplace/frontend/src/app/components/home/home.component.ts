import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService, ProductList } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

interface CulturalCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('featuredSection') featuredSection!: ElementRef;
  
  featuredProducts: ProductList[] = [];
  loading = false;

  culturalCategories: CulturalCategory[] = [
    {
      id: 1,
      name: 'Traditional Textiles',
      description: 'Authentic fabrics and clothing representing diverse African cultures',
      icon: 'checkroom',
      color: 'primary'
    },
    {
      id: 2,
      name: 'Handcrafted Art',
      description: 'Beautiful sculptures, paintings, and decorative pieces',
      icon: 'palette',
      color: 'accent'
    },
    {
      id: 3,
      name: 'Musical Instruments',
      description: 'Traditional drums, flutes, and other musical instruments',
      icon: 'music_note',
      color: 'warn'
    },
    {
      id: 4,
      name: 'Jewelry & Accessories',
      description: 'Handmade jewelry using traditional techniques and materials',
      icon: 'diamond',
      color: 'primary'
    },
    {
      id: 5,
      name: 'Home Decor',
      description: 'Unique decorative items to bring African heritage to your home',
      icon: 'home',
      color: 'accent'
    },
    {
      id: 6,
      name: 'Traditional Tools',
      description: 'Authentic tools and implements used in traditional crafts',
      icon: 'build',
      color: 'warn'
    }
  ];

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.loading = true;
    this.apiService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.loading = false;
        this.snackBar.open('Failed to load featured products', 'Close', {
          duration: 3000
        });
      }
    });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: ProductList): void {
    if (!product.in_stock) {
      this.snackBar.open('Product is out of stock', 'Close', {
        duration: 3000
      });
      return;
    }

    this.cartService.addToCart(product, 1);
    this.snackBar.open(`${product.name} added to cart`, 'View Cart', {
      duration: 3000
    }).onAction().subscribe(() => {
      this.router.navigate(['/cart']);
    });
  }

  scrollToFeatured(): void {
    if (this.featuredSection) {
      this.featuredSection.nativeElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  }
}
