import { Injectable } from '@angular/core';
import { 
  HttpClient, 
  HttpParams, 
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, filter, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { 
    console.log('Initializing ProductService with API URL:', this.apiUrl);
  }

  // ==================== Enhanced CRUD Operations ====================
  getProducts(): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    console.log('Fetching products from:', this.apiUrl);
    return this.http.get<Product[]>(this.apiUrl, {
      headers,
      params: new HttpParams().set('cache', 'true')
    }).pipe(
      tap(() => console.log('Successfully fetched products')),
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  getAllProducts = this.getProducts;

  getProductById(id: number): Observable<Product> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/${id}`;
    console.log('Fetching product from:', url);
    return this.http.get<Product>(url, { headers }).pipe(
      tap(() => console.log('Successfully fetched product')),
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    console.log('Creating product with JSON data:', product);
    return this.http.post<Product>(
      this.apiUrl,
      this.cleanProductData(product),
      { headers }
    ).pipe(
      tap((createdProduct) => console.log('Successfully created product:', createdProduct)),
      catchError(this.handleError.bind(this))
    );
  }

  createProductWithImage(formData: FormData): Observable<Product> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    console.log('Creating product with FormData');
    return this.http.post<Product>(this.apiUrl, formData, { headers }).pipe(
      tap((createdProduct) => console.log('Successfully created product with image:', createdProduct)),
      catchError(this.handleError.bind(this))
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/${id}`;
    console.log('Updating product with JSON data:', product);
    return this.http.put<Product>(url, this.cleanProductData(product), { headers }).pipe(
      tap((updatedProduct) => console.log('Successfully updated product:', updatedProduct)),
      catchError(this.handleError.bind(this))
    );
  }

  updateProductWithImage(id: number, formData: FormData): Observable<Product> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/${id}`;
    console.log('Updating product with FormData');
    return this.http.put<Product>(url, formData, { headers }).pipe(
      tap((updatedProduct) => console.log('Successfully updated product with image:', updatedProduct)),
      catchError(this.handleError.bind(this))
    );
  }

  deleteProduct(id: number): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/${id}`;
    console.log('Deleting product at:', url);
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => console.log('Successfully deleted product')),
      catchError(this.handleError.bind(this))
    );
  }

  // ==================== Specialized Queries ====================
  getProductsBySeller(sellerId: number): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/seller/${sellerId}`;
    console.log('Fetching products by seller from:', url);
    return this.http.get<Product[]>(url, { headers }).pipe(
      tap(() => console.log('Successfully fetched products by seller')),
      catchError(this.handleError.bind(this))
    );
  }

  getLowStockProducts(sellerId: number, threshold: number = 10): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/low-stock/${sellerId}`;
    console.log('Fetching low stock products from:', url);
    return this.http.get<Product[]>(url, {
      headers,
      params: new HttpParams().set('threshold', threshold.toString())
    }).pipe(
      tap(() => console.log('Successfully fetched low stock products')),
      catchError(this.handleError.bind(this))
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/category/${encodeURIComponent(category)}`;
    console.log('Fetching products by category from:', url);
    return this.http.get<Product[]>(url, { headers }).pipe(
      tap(() => console.log('Successfully fetched products by category')),
      catchError(this.handleError.bind(this))
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/search`;
    console.log('Searching products from:', url);
    return this.http.get<Product[]>(url, {
      headers,
      params: new HttpParams().set('query', query)
    }).pipe(
      tap(() => console.log('Successfully searched products')),
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  // ==================== Utility Methods ====================
  uploadProductImage(
    productId: number, 
    image: File,
    progressCallback?: (percentage: number) => void
  ): Observable<{ imageUrl: string }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/${productId}/image`;
    console.log('Uploading product image to:', url);
    
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<{ imageUrl: string }>(
      url,
      formData,
      { 
        headers,
        reportProgress: true, 
        observe: 'events' 
      }
    ).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress && progressCallback) {
          const progress = Math.round(100 * (event.loaded / (event.total || 1)));
          progressCallback(progress);
          return null;
        } else if (event.type === HttpEventType.Response) {
          console.log('Successfully uploaded product image');
          return event.body!;
        }
        return null;
      }),
      filter((val): val is { imageUrl: string } => val !== null),
      catchError(this.handleError.bind(this))
    );
  }

  getAllCategories(): Observable<string[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/categories`;
    console.log('Fetching all categories from:', url);
    return this.http.get<string[]>(url, { headers }).pipe(
      tap(() => console.log('Successfully fetched categories')),
      catchError(this.handleError.bind(this))
    );
  }

  getFeaturedProducts(limit: number = 5): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/featured`;
    console.log('Fetching featured products from:', url);
    return this.http.get<Product[]>(url, {
      headers,
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      tap(() => console.log('Successfully fetched featured products')),
      catchError(this.handleError.bind(this))
    );
  }

  getRelatedProducts(productId: number, limit: number = 4): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });

    const url = `${this.apiUrl}/${productId}/related`;
    console.log('Fetching related products from:', url);
    return this.http.get<Product[]>(url, {
      headers,
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      tap(() => console.log('Successfully fetched related products')),
      catchError(this.handleError.bind(this))
    );
  }

  // ==================== Enhanced Error Handling ====================
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    let diagnosticInfo = '';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
      diagnosticInfo = `Check your network connection and browser console.`;
    } else {
      errorMessage = `Server Error (${error.status}): ${error.message}`;
      diagnosticInfo = `Server at ${this.apiUrl} is not responding.`;
      
      if (error.status === 0) {
        errorMessage = 'Backend Connection Failed';
        diagnosticInfo = `Cannot connect to ${this.apiUrl}. Possible causes:
        - Backend server is not running
        - Incorrect API URL
        - CORS configuration issue
        - Network firewall blocking the connection`;
      } else if (error.error?.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    console.error(`ProductService Error:
    Message: ${errorMessage}
    URL: ${error.url}
    Diagnostic: ${diagnosticInfo}
    Full Error:`, error);
    
    return throwError(() => new Error(errorMessage));
  }

  // ==================== Helper Methods ====================
  private cleanProductData(product: Partial<Product>): Partial<Product> {
    return {
      name: product.name?.trim() || '',
      description: product.description?.trim() || '',
      price: product.price || 0,
      stockQuantity: product.stockQuantity || 0,
      category: product.category?.trim() || 'Other',
      imageUrl: product.imageUrl?.trim() || '',
      sellerId: product.sellerId
    };
  }
}