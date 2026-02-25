import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedComponent } from './authorized/authorized.component';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './auth.guard';
import { CStockHttpInterceptor } from './cstock-http.interceptor';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export function tokenGetter(): string | null {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AuthorizedComponent,
  ],
  imports: [
    CommonModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: [environment.authServerDomain],
        disallowedRoutes: [
          `${environment.authServerUrl}/oauth2/token`,
          `${environment.authServerUrl}/oauth2/authorize`
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
