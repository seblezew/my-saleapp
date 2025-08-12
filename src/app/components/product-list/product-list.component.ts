import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading = true;
  searchQuery = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    if (this.selectedCategory) {
      this.productService.getProductsByCategory(this.selectedCategory).subscribe({
        next: (products: Product[]) => {
          this.products = products;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading products:', error);
          this.loading = false;
        }
      });
    } else {
      this.productService.getProducts().subscribe({  // Changed from getAllProducts() to getProducts()
        next: (products: Product[]) => {
          this.products = products;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading products:', error);
          this.loading = false;
        }
      });
    }
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  searchProducts(): void {
    if (this.searchQuery.trim()) {
      this.productService.searchProducts(this.searchQuery).subscribe({
        next: (products: Product[]) => {
          this.products = products;
        },
        error: (error: any) => {
          console.error('Error searching products:', error);
        }
      });
    } else {
      this.loadProducts();
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}