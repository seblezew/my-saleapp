import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        retry(1),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = '';
          
          if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // Server-side error
            if (error.status === 0) {
              errorMessage = 'Server connection failed. Please check if the backend server is running.';
              // Show a persistent notification
              this.snackBar.open(errorMessage, 'Dismiss', {
                duration: 10000, // 10 seconds
                panelClass: ['error-snackbar']
              });
            } else {
              errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            }
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }
}