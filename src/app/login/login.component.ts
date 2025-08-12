import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  loginType: 'admin' | 'seller' = 'admin';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  switchLoginType(type: 'admin' | 'seller'): void {
    this.loginType = type;
    this.errorMessage = '';
    this.loginForm.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter valid email and password';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    const login$ = this.loginType === 'seller' 
      ? this.authService.sellerLogin(email, password)
      : this.authService.adminLogin(email, password);

    login$.pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        if (this.loginType === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/seller/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}