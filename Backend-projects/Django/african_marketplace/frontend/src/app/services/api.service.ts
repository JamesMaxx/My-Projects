import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Customer {
  id: number;
  user: User;
  phone: string;
  address: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  cultural_significance: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  category_name: string;
  image?: string;
  image_url?: string;
  origin_tribe: string;
  cultural_meaning: string;
  traditional_use: string;
  materials_used: string;
  is_featured: boolean;
  in_stock: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductList {
  id: number;
  name: string;
  price: number;
  category_name: string;
  image_url?: string;
  is_featured: boolean;
  in_stock: boolean;
  origin_tribe: string;
}

export interface Order {
  id: number;
  customer: number;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentCustomerSubject = new BehaviorSubject<Customer | null>(null);

  public currentUser = this.currentUserSubject.asObservable();
  public currentCustomer = this.currentCustomerSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.checkAuthStatus();
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };
  }

  // Authentication methods
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/`, userData, this.getHttpOptions());
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, 
      { username, password }, 
      this.getHttpOptions()
    ).pipe(
      map((response: any) => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          this.currentCustomerSubject.next(response.customer);
        }
        return response;
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout/`, {}, this.getHttpOptions()).pipe(
      map((response: any) => {
        this.currentUserSubject.next(null);
        this.currentCustomerSubject.next(null);
        return response;
      })
    );
  }

  checkAuthStatus(): void {
    this.http.get(`${this.baseUrl}/auth/profile/`, this.getHttpOptions()).subscribe({
      next: (response: any) => {
        this.currentUserSubject.next(response.user);
        this.currentCustomerSubject.next(response.customer);
      },
      error: () => {
        this.currentUserSubject.next(null);
        this.currentCustomerSubject.next(null);
      }
    });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile/update/`, profileData, this.getHttpOptions());
  }

  // Category methods
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`);
  }

  // Product methods
  getProducts(params?: any): Observable<PaginatedResponse<ProductList>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          queryParams.append(key, params[key].toString());
        }
      });
    }
    
    const url = queryParams.toString() ? 
      `${this.baseUrl}/products/?${queryParams.toString()}` : 
      `${this.baseUrl}/products/`;
    
    return this.http.get<PaginatedResponse<ProductList>>(url);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}/`);
  }

  getFeaturedProducts(): Observable<ProductList[]> {
    return this.http.get<ProductList[]>(`${this.baseUrl}/products/featured/`);
  }

  // Order methods
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/`, this.getHttpOptions());
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/create/`, orderData, this.getHttpOptions());
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}/`, this.getHttpOptions());
  }

  // Utility methods
  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get currentCustomerValue(): Customer | null {
    return this.currentCustomerSubject.value;
  }
}
