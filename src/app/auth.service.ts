import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  // Seller Registration
  registerSeller(sellerData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    password: string;
    password_confirmation?: string;
    commission_rate?: number;
  }): Observable<any> {
    // Remove confirmation field if present
    const { password_confirmation, ...dataToSend } = sellerData;
    
    return this.http.post<any>(`${this.apiUrl}/sellers/register`, dataToSend).pipe(
      tap(response => {
        if (response.token) {
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          const user = {
            email: sellerData.email,
            token: response.token,
            role: 'seller',
            userId: decodedToken.id || response.seller?.id,
            expiresAt: decodedToken.exp * 1000,
            seller: response.seller
          };
          this.storeUserData(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  // User Registration
  register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        if (response.token) {
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          const user = {
            email: userData.email,
            token: response.token,
            role: decodedToken.role || userData.role,
            userId: decodedToken.id || response.userId,
            expiresAt: decodedToken.exp * 1000
          };
          this.storeUserData(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Admin Login
  adminLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/admin`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          const user = {
            email: email,
            token: response.token,
            role: 'admin',
            userId: decodedToken.id || response.userId,
            expiresAt: decodedToken.exp * 1000
          };
          this.storeUserData(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Seller Login
  sellerLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/seller`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          const user = {
            email: email,
            token: response.token,
            role: 'seller',
            userId: decodedToken.id || response.userId,
            expiresAt: decodedToken.exp * 1000,
            seller: response.seller
          };
          this.storeUserData(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Logout
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Token Management
  getToken(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser?.token || null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  isAdmin(): boolean {
    if (!this.isLoggedIn()) return false;
    const currentUser = this.currentUserValue;
    return currentUser?.role === 'admin';
  }

  isSeller(): boolean {
    if (!this.isLoggedIn()) return false;
    const currentUser = this.currentUserValue;
    return currentUser?.role === 'seller';
  }

  getUserId(): number | null {
    if (!this.isLoggedIn()) return null;
    const currentUser = this.currentUserValue;
    return currentUser?.userId || null;
  }

  getTokenExpiration(): Date | null {
    const token = this.getToken();
    return token ? this.jwtHelper.getTokenExpirationDate(token) : null;
  }

  getCurrentUser(): any {
    if (!this.isLoggedIn()) {
      return null;
    }
    
    const currentUser = this.currentUserValue;
    const decodedToken = this.jwtHelper.decodeToken(currentUser.token);
    
    return {
      id: currentUser.userId || decodedToken.id,
      email: currentUser.email,
      role: currentUser.role,
      ...decodedToken,
      ...(currentUser.seller ? { seller: currentUser.seller } : {})
    };
  }

  // Refresh Token
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap(response => {
        if (response.token) {
          const currentUser = this.currentUserValue;
          currentUser.token = response.token;
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          currentUser.expiresAt = decodedToken.exp * 1000;
          this.storeUserData(currentUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Private Methods
  private storeUserData(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Could not connect to server';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Bad request';
      } else if (error.status === 401) {
        errorMessage = error.error?.message || 'Unauthorized access';
      } else if (error.status === 403) {
        errorMessage = error.error?.message || 'Access forbidden';
      } else if (error.status === 404) {
        errorMessage = error.error?.message || 'Resource not found';
      } else if (error.status === 422) {
        errorMessage = error.error?.message || 'Validation failed';
      } else if (error.status === 500) {
        errorMessage = error.error?.message || 'Server error occurred';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}