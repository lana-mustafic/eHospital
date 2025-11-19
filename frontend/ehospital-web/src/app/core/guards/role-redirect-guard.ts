import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, catchError, of, timeout } from 'rxjs';

export const roleRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // If we already have a user with role loaded, redirect immediately
  const current = authService.getCurrentUser();
  if (current) {
    console.log('Role redirect guard - Current user:', current);
    console.log('Role redirect guard - Current user role:', current.role);
    
    if (!current.role) {
      console.warn('No role found for current user, fetching user data...');
      // Fall through to fetch user
    } else {
      const roleLower = current.role.toLowerCase().trim();
      console.log('Role redirect guard - Normalized role:', roleLower);
      
      if (roleLower === 'patient') {
        console.log('Redirecting to /my/home');
        router.navigate(['/my/home'], { replaceUrl: true });
        return false;
      } else if (roleLower === 'doctor') {
        console.log('Redirecting doctor to /my/home');
        router.navigate(['/my/home'], { replaceUrl: true });
        return false;
      } else if (['admin', 'nurse', 'receptionist'].includes(roleLower)) {
        console.log('Redirecting to /dashboard');
        router.navigate(['/dashboard'], { replaceUrl: true });
        return false;
      } else {
        console.warn('Unknown role, redirecting to /not-authorized. Role was:', current.role);
        router.navigate(['/not-authorized'], { replaceUrl: true });
        return false;
      }
    }
  }

  // Otherwise, fetch the user profile first, then redirect
  console.log('Role redirect guard - Fetching current user...');
  return authService.fetchCurrentUser().pipe(
    timeout(6000),
    map((user) => {
      console.log('Role redirect guard - Fetched user:', user);
      if (user && user.role) {
        const roleLower = user.role.toLowerCase().trim();
        console.log('Role redirect guard - Normalized role:', roleLower);
        
        if (roleLower === 'patient') {
          console.log('Redirecting to /my/home');
          router.navigate(['/my/home'], { replaceUrl: true });
        } else if (roleLower === 'doctor') {
          console.log('Redirecting doctor to /my/home');
          router.navigate(['/my/home'], { replaceUrl: true });
        } else if (['admin', 'nurse', 'receptionist'].includes(roleLower)) {
          console.log('Redirecting to /dashboard');
          router.navigate(['/dashboard'], { replaceUrl: true });
        } else {
          console.warn('Unknown role, redirecting to /not-authorized. Role was:', user.role);
          router.navigate(['/not-authorized'], { replaceUrl: true });
        }
      } else {
        console.error('No role found for user:', user);
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      }
      return false;
    }),
    catchError((error) => {
      console.error('Role redirect guard error:', error);
      const storedUser = authService.getCurrentUser();
      if (storedUser && storedUser.role) {
        const roleLower = storedUser.role.toLowerCase();
        if (roleLower === 'patient') {
          router.navigate(['/my/home'], { replaceUrl: true });
        } else if (roleLower === 'doctor') {
          router.navigate(['/my/home'], { replaceUrl: true });
        } else if (['admin', 'nurse', 'receptionist'].includes(roleLower)) {
          router.navigate(['/dashboard'], { replaceUrl: true });
        } else {
          router.navigate(['/not-authorized'], { replaceUrl: true });
        }
      } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      }
      return of(false);
    })
  );
};

