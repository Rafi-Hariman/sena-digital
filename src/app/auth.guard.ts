import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('Access denied. Redirecting to login...');
      this.router.navigate(['/login']); // Redirect to login
      return false; // Prevent navigation
    }
    return true; // Allow navigation
  }
}
