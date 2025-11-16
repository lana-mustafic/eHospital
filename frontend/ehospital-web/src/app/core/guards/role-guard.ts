import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { catchError, map, of, switchMap } from 'rxjs';

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
  return authService.fetchCurrentUser().pipe(
    map(() => {
      if (authService.hasRole(...allowedRoles)) {
        return true;
      }
      router.navigate(['/not-authorized']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );

  // Fallback (should not reach)
};


