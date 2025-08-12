import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedComponent } from './authorized/authorized.component';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './auth.guard';
import { CstockHttpInterceptor } from './cstock-http.interceptor';

export function tokenGetter(): string {
  return localStorage.getItem('token')!;
}

@NgModule({
  declarations: [
    AuthorizedComponent
  ],
  imports: [
    CommonModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: [ /localhost:8080/ ],
        disallowedRoutes: ['http://localhost:8080/oauth2/token', 'http://localhost:8080/users'
        ]
      }
    })
  ],
  providers: [
    JwtHelperService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CstockHttpInterceptor,
      multi: true
    }
  ]
})
export class SecurityModule { }
