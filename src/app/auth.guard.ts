import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.token) {
          return true;
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}