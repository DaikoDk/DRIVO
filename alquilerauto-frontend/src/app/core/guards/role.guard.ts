import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  static forRole(expectedRole: string): CanActivateFn {
    return () => {
      const auth = inject(AuthService);
      const router = inject(Router);
      const user = auth.currentUser();
      if (!user) {
        router.navigate(['/login']);
        return false;
      }
      if (user.rol !== expectedRole) {
        if (user.rol === 'ADMIN') {
          router.navigate(['/admin/dashboard']);
        } else {
          router.navigate(['/portal/home']);
        }
        return false;
      }
      return true;
    };
  }
}
