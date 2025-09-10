import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class CStockHttpInterceptor implements HttpInterceptor {

  private refreshInProgress: Promise<string | null> | null = null;

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔄 Interceptando requisição:', req.url);
    if (req.url.includes('/oauth2/token')) {
      console.log('⏭️  Pulando interceptor para endpoint de token');
      return next.handle(req);
    }

    const baseHeaders: { [key: string]: string } = {
      'Accept': 'application/json'
    };

    const token = this.auth.getAccessToken();
    console.log('🔐 Token disponível:', token ? 'SIM' : 'NÃO');
    if (token) {
      console.log('📋 Token:', token.substring(0, 50) + '...');
      baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    const authReq = req.clone({
      setHeaders: baseHeaders
    });

    if (!token && !this.refreshInProgress) {
      this.refreshInProgress = this.auth.getNewAccessToken();
    }

    if (this.refreshInProgress) {
      return from(this.refreshInProgress).pipe(
        switchMap(newToken => {
          this.refreshInProgress = null;

          if (newToken) {
            const refreshedReq = req.clone({
              setHeaders: {
                'Authorization': `Bearer ${newToken}`,
                'Accept': 'application/json'
              }
            });
            return next.handle(refreshedReq);
          }

          return next.handle(authReq);
        })
      );
    }

    return next.handle(authReq);
  }
}
