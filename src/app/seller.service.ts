import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface SellerRegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  commission_rate: number;
  password: string;
  password_confirmation: string;
}

interface Seller {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  commission_rate: number;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = 'http://localhost:8888/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Create headers with the Bearer token from AuthService
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);

    let errorResponse: {
      message: string;
      errors: { [key: string]: string[] };
      status: number;
    } = {
      message: '',
      errors: {},
      status: error.status
    };

    try {
      if (typeof error.error === 'string') {
        errorResponse = JSON.parse(error.error);
      } else if (typeof error.error === 'object') {
        errorResponse = { ...errorResponse, ...error.error };
      }
    } catch (e) {
      errorResponse.message = error.message || 'Unknown error occurred';
    }

    let errorMessage = errorResponse.message || 'An unexpected error occurred';
    const validationErrors: string[] = [];

    if (errorResponse.errors) {
      Object.entries(errorResponse.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          validationErrors.push(...messages.map(m => `${field}: ${m}`));
        }
      });
    }

    if (error.status === 401) {
      errorMessage = 'Your session has expired. Please login again.';
    }

    return throwError(() => ({
      message: errorMessage,
      validationErrors: validationErrors.length ? validationErrors : [errorMessage],
      status: error.status,
      originalError: error
    }));
  }

  // Seller Registration
  registerSeller(sellerData: SellerRegistrationData): Observable<{ seller: Seller; message: string }>
   {

    const token = this.authService.getToken(); // Get stored token
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    });


    if (!this.authService.isAdmin()) {
      return throwError(() => ({ 
        status: 403,
        message: 'Only administrators can register sellers' 
      }));
    }

    return this.http.post<ApiResponse<{ seller: Seller; message: string }>>(
      `${this.apiUrl}/sellers/register`, 
      sellerData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => ({
        seller: response.data?.seller as Seller,
        message: response.message || 'Seller registered successfully'
      })),
      catchError(this.handleError)
    );
  }

  // Get All Sellers
  getSellers(page: number = 1, perPage: number = 10, search: string = ''): Observable<Seller[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString())
      .set('search', search);

    return this.http.get<ApiResponse<Seller[]>>(
      `${this.apiUrl}/sellers`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Get Paginated Sellers
  getPaginatedSellers(page: number = 1, perPage: number = 10): Observable<PaginatedResponse<Seller>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedResponse<Seller>>(
      `${this.apiUrl}/sellers/paginated`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get Seller by ID
  getSellerById(id: number): Observable<Seller> {
    return this.http.get<ApiResponse<Seller>>(
      `${this.apiUrl}/sellers/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data as Seller),
      catchError(this.handleError)
    );
  }

  // Update Seller
  updateSeller(id: number, sellerData: Partial<Seller>): Observable<{ seller: Seller; message: string }> {
    return this.http.put<ApiResponse<{ seller: Seller; message: string }>>(
      `${this.apiUrl}/sellers/${id}`,
      sellerData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => ({
        seller: response.data?.seller as Seller,
        message: response.message || 'Seller updated successfully'
      })),
      catchError(this.handleError)
    );
  }

  // Delete Seller
  deleteSeller(id: number): Observable<{ message: string }> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/sellers/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(() => ({ message: 'Seller deleted successfully' })),
      catchError(this.handleError)
    );
  }

  // Get Top Performing Sellers
  getTopSellers(limit: number = 5): Observable<Seller[]> {
    return this.http.get<ApiResponse<Seller[]>>(
      `${this.apiUrl}/sellers/top`,
      { 
        headers: this.getAuthHeaders(),
        params: { limit: limit.toString() }
      }
    ).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Search Sellers
  searchSellers(query: string): Observable<Seller[]> {
    return this.http.get<ApiResponse<Seller[]>>(
      `${this.apiUrl}/sellers/search`,
      {
        headers: this.getAuthHeaders(),
        params: { q: query }
      }
    ).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Get Seller Statistics
  getSellerStatistics(): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/sellers/statistics`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
}
