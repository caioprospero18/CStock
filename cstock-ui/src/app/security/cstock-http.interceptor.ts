import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class CStockHttpInterceptor implements HttpInterceptor {

  private isRefreshing = false;

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔗 Interceptando:', req.url);
    console.log('🔐 Token presente:', !!this.auth.getAccessToken());

    if (req.url.includes('/oauth2/token')) {
      return next.handle(req);
    }

    const token = this.auth.getAccessToken();

    if (token) {
      const authReq = this.addToken(req, token);

      return next.handle(authReq).pipe(
        catchError(error => {
          if (error.status === 401 && !this.isRefreshing) {
            return this.handle401Error(req, next);
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.isRefreshing = true;

    return from(this.auth.getNewAccessToken()).pipe(
      switchMap(newToken => {
        this.isRefreshing = false;

        if (newToken) {
          return next.handle(this.addToken(req, newToken));
        }

        this.auth.logout();
        return throwError(() => new Error('Sessão expirada'));
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.auth.logout();
        return throwError(() => error);
      })
    );
  }
}
