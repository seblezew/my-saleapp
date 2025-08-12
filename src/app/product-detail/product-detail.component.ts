// src/app/components/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  loading = true;
  relatedProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProductDetails(+id);
    }
  }

  private loadProductDetails(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.loadRelatedProducts(product.category);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  private loadRelatedProducts(category?: string): void {
    if (category) {
      this.productService.getProductsByCategory(category)
        .subscribe(products => {
          this.relatedProducts = products.filter(p => p.id !== this.product?.id).slice(0, 4);
        });
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
    }
  }

  addRelatedToCart(relatedProduct: Product, event: Event): void {
    event.stopPropagation();
    if (this.isLoggedIn() && relatedProduct.stockQuantity > 0) {
      this.cartService.addToCart(relatedProduct);
      // You might want to add a notification here
    } else if (!this.isLoggedIn()) {
      // Optionally redirect to login page or show a message
      console.log('Please log in to add items to cart');
    }
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}