import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onLogin(): void {
    this.isSubmitting = true;

    const { email, password } = this.loginForm.value;

    if (this.loginForm.valid && email.endsWith('@gmail.com') && password.trim() !== '') {
      setTimeout(() => {
        this.router.navigate(['/admin']); // Navigate to admin dashboard
      }, 1000);
    } else {
      alert('Invalid credentials. Use a Gmail address and non-empty password.');
      this.isSubmitting = false;
    }
  }
}