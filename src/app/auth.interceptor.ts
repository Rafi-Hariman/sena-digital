import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  /**
   * Clear authentication state and redirect to login
   * Called when 401/403 errors occur to prevent role confusion
   */
  private clearAuthStateAndRedirect(): void {
    try {
      // Clear all authentication-related storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('formData');
      localStorage.removeItem('formRegis');
      localStorage.removeItem('profileUpdated');
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });

      console.log('Authentication state cleared due to 401/403 error');
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }

    // Force complete page reload to reset application state
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');

    // Tambahkan token ke header request jika tersedia
    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Unauthorized request - Clearing auth state and redirecting to login...');
          this.clearAuthStateAndRedirect();
        } else if (error.status === 403) {
          console.error('Access denied - Clearing auth state and redirecting to login...');
          this.clearAuthStateAndRedirect();
        }
        return throwError(() => error);
      })
    );
  }
}
