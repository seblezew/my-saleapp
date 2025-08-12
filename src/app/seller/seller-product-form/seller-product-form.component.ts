import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../auth.service';
import { Product } from '../../models/product.model';
import { urlValidator } from '../../validators/url.validator';

@Component({
  selector: 'app-seller-product-form',
  templateUrl: './seller-product-form.component.html',
  styleUrls: ['./seller-product-form.component.css']
})
export class SellerProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Toys', 'Other'];
  currentSellerId: number;
  defaultProductImage = 'assets/images/techno.jpeg';
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.currentSellerId = this.authService.getCurrentUser().id;
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.maxLength(1000)],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: ['', [urlValidator()]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProductData(this.productId);
      }
    });
  }

  loadProductData(productId: number): void {
    this.isLoading = true;
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        if (product.sellerId !== this.currentSellerId) {
          this.router.navigate(['/seller/dashboard']);
          this.showError('You can only edit your own products');
          return;
        }
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          category: product.category,
          imageUrl: product.imageUrl || this.defaultProductImage
        });
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load product data');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      // Clear the URL field when a file is selected
      this.productForm.get('imageUrl')?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      console.error('Form is invalid:', this.productForm.errors);
      this.showError('Please fill all required fields correctly');
      return;
    }

    this.isLoading = true;
    
    const productData = this.prepareProductData();
    console.log('Prepared product data:', productData);

    const operation = this.isEditMode && this.productId
      ? this.productService.updateProduct(this.productId, productData)
      : this.productService.createProduct(productData);

    operation.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open(`Product ${this.isEditMode ? 'updated' : 'created'} successfully!`, 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/seller/products']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Full error object:', error);
        
        let errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} product`;
        if (error.error?.message) {
          errorMessage += `: ${error.error.message}`;
        } else if (error.statusText) {
          errorMessage += `: ${error.statusText}`;
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Check your network connection.';
        } else if (error.status === 404) {
          errorMessage = 'Server endpoint not found. Please check backend is running.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private prepareProductData(): Partial<Product> {
    const formValue = this.productForm.value;
    const productData: Partial<Product> = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      stockQuantity: formValue.stockQuantity,
      category: formValue.category,
      sellerId: this.currentSellerId,
      imageUrl: formValue.imageUrl || this.defaultProductImage
    };

    // If an image file is selected, we'll handle it separately in the service
    // or you can convert it to base64 here if your backend expects that
    return productData;
  }

  navigateToProducts(): void {
    this.router.navigate(['/seller/products']);
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}