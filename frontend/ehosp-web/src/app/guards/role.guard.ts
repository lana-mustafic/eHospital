import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const user = this.authService.getCurrentUser();
    
    if (user && expectedRoles.includes(user.roleName)) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}