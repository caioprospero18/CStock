import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedComponent } from './authorized/authorized.component';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './auth.guard';
import { CStockHttpInterceptor } from './cstock-http.interceptor';
import { AuthService } from './auth.service';
import { RedirectOauthComponent } from './redirect-oauth/redirect-oauth.component';

export function tokenGetter(): string | null {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AuthorizedComponent,
    RedirectOauthComponent
  ],
  imports: [
    CommonModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: [/localhost:8080/],
        disallowedRoutes: [
          'http://localhost:8080/oauth2/token',
          'http://localhost:8080/oauth2/authorize'
        ]
      }
    })
  ],
  providers: [
    JwtHelperService,
    AuthGuard,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CStockHttpInterceptor,
      multi: true
    }
  ]
})
export class SecurityModule { }
