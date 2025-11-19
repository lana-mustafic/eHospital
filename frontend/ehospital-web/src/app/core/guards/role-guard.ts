import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { catchError, map, of, timeout } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] || [];

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // If roles not specified, allow
  if (allowedRoles.length === 0) {
    return true;
  }

  // If we already have a user with role loaded, evaluate immediately
  const current = authService.getCurrentUser();
  if (current && current.role) {
    if (authService.hasRole(...allowedRoles)) {
      return true;
    }
    router.navigate(['/not-authorized']);
    return false;
  }

  // Otherwise, fetch the user profile first, then evaluate
  // Add timeout to prevent hanging if API is unreachable
  return authService.fetchCurrentUser().pipe(
    timeout(6000), // 6 second timeout
    map(() => {
      if (authService.hasRole(...allowedRoles)) {
        return true;
      }
      router.navigate(['/not-authorized']);
      return false;
    }),
    catchError((error) => {
      console.error('Role guard error:', error);
      // If we have stored user, try to use it
      const storedUser = authService.getCurrentUser();
      if (storedUser && storedUser.role) {
        if (authService.hasRole(...allowedRoles)) {
          return of(true);
        }
        router.navigate(['/not-authorized']);
        return of(false);
      }
      // Otherwise redirect to login
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};


