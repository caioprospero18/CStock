import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.auth.isInvalidAccessToken()) {
      console.log('Navegação com access token inválido. Obtendo novo token...');

      return this.auth.getNewAccessToken()
        .then(() => {
          if (this.auth.isInvalidAccessToken()) {
            this.auth.login();
            return false;
          }

          return this.podeAcessarRota(next.data['roles']);
        });
    }

    return this.podeAcessarRota(next.data['roles']);
  }

  podeAcessarRota(roles: string[]): boolean {
    if (roles && !this.auth.hasAnyPermission(roles)) {
      this.router.navigate(['/not-authorized']);
      return false;
    }

    return true;
  }

}
