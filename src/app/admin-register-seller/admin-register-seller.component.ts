import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SellerService } from '../seller.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin-register-seller',
  templateUrl: './admin-register-seller.component.html',
  styleUrls: ['./admin-register-seller.component.css']
})
export class AdminRegisterSellerComponent implements OnInit {
  sellerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  formSubmitAttempt = false;

  constructor(
    private fb: FormBuilder,
    private sellerService: SellerService,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location,
    private authService: AuthService
  ) {
    this.sellerForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(255)
      ]],
      phone: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{10,15}$/)
      ]],
      address: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(500)
      ]],
      commissionRate: [0, [
        Validators.required, 
        Validators.min(0), 
        Validators.max(100),
        Validators.pattern(/^\d+\.?\d{0,2}$/)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.maxLength(255),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Verify admin status on component initialization
    if (!this.authService.isAdmin()) {
      this.showError('Only administrators can access this page');
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get formControls() {
    return this.sellerForm.controls;
  }

  onSubmit(): void {
    this.formSubmitAttempt = true;
    
    if (this.sellerForm.invalid) {
      this.sellerForm.markAllAsTouched();
      this.showError('Please correct all form errors');
      return;
    }

    this.isLoading = true;

    const formData = this.sellerForm.value;
    const apiData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone.trim(),
      address: formData.address.trim(),
      commission_rate: Number(formData.commissionRate),
      password: formData.password,
      password_confirmation: formData.confirmPassword
    };

    console.log('Submitting seller registration:', apiData);

    this.sellerService.registerSeller(apiData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Registration successful:', response);
        this.showSuccess(response.message || 'Seller registered successfully!');
        this.router.navigate(['/admin/sellers']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.handleRegistrationError(error);
      }
    });
  }

  private handleRegistrationError(error: any): void {
    let errorMessage = 'Registration failed';
    
    if (error.status === 401 || error.status === 403) {
      errorMessage = error.message || 'Authentication failed. Please login as admin.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    
    if (error.validationErrors?.length) {
      errorMessage += ':\n' + error.validationErrors.join('\n');
    } else if (error.message) {
      errorMessage += ': ' + error.message;
    }

    this.showError(errorMessage);
  }

  onCancel(): void {
    if (this.sellerForm.dirty) {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        this.location.back();
      }
    } else {
      this.location.back();
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 10000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.sellerForm.get(controlName);
    
    if (!control?.errors || !this.formSubmitAttempt) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }
    
    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    }
    
    if (control.hasError('maxlength')) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
    }
    
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control.hasError('pattern')) {
      if (controlName === 'password') {
        return 'Password must contain at least one uppercase, one lowercase, one number and one special character';
      }
      if (controlName === 'phone') {
        return 'Please enter a valid phone number (10-15 digits)';
      }
      if (controlName === 'firstName' || controlName === 'lastName') {
        return 'Only letters and spaces are allowed';
      }
      if (controlName === 'commissionRate') {
        return 'Please enter a valid number (max 2 decimal places)';
      }
      return 'Invalid format';
    }
    
    if (control.hasError('mismatch') && controlName === 'confirmPassword') {
      return 'Passwords do not match';
    }
    
    if (control.hasError('min') || control.hasError('max')) {
      return `Value must be between ${control.errors['min']?.min || 0} and ${control.errors['max']?.max || 100}`;
    }

    return 'Invalid value';
  }
}