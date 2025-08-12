import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent {
  currentUserRole: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
   const user = this.authService.currentUserValue;
    this.currentUserRole = user?.role || null;
  }

  navigateToDashboard() {
    if (this.currentUserRole === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.currentUserRole === 'seller') {
      this.router.navigate(['/seller/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}