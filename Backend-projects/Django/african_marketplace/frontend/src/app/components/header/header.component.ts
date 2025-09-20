import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { ApiService, User } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  cartItemCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.subscriptions.push(
      this.apiService.currentUser.subscribe(user => {
        this.currentUser = user;
      })
    );

    // Subscribe to cart changes
    this.subscriptions.push(
      this.cartService.cartItems.subscribe(items => {
        this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get isLoggedIn(): boolean {
    return this.apiService.isLoggedIn;
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value.trim();
    if (searchTerm) {
      // Navigate to products page with search parameter
      // This will be implemented when we create the product list component
      console.log('Search for:', searchTerm);
    }
  }

  logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }
}
