import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Toys'];
  tags: string[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      sku: [''],
      category: ['', Validators.required],
      imageFile: [null]
    });
  }

  ngOnInit(): void {
    // Load product data if in edit mode
    if (this.isEditMode) {
      this.loadProductData();
    }
  }

  loadProductData(): void {
    // Mock data for edit mode
    const mockProduct = {
      name: 'Sample Product',
      description: 'This is a sample product description',
      price: 29.99,
      stockQuantity: 50,
      sku: 'PRD-001',
      category: 'Electronics',
      tags: ['new', 'featured']
    };

    this.productForm.patchValue(mockProduct);
    this.tags = mockProduct.tags;
    this.imagePreview = 'assets/images/default-product.png';
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.productForm.patchValue({ imageFile: file });
      this.productForm.get('imageFile')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    
    // Append form values to FormData
    Object.keys(this.productForm.value).forEach(key => {
      if (key !== 'imageFile') {
        formData.append(key, this.productForm.value[key]);
      }
    });

    // Append image file if exists
    if (this.productForm.value.imageFile) {
      formData.append('image', this.productForm.value.imageFile);
    }

    // Append tags
    formData.append('tags', JSON.stringify(this.tags));

    // Here you would typically call your product service
    console.log('Form data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open(
        `Product ${this.isEditMode ? 'updated' : 'created'} successfully!`, 
        'Close', 
        { duration: 3000 }
      );
      if (!this.isEditMode) {
        this.productForm.reset();
        this.tags = [];
        this.imagePreview = null;
      }
    }, 1500);
  }
}