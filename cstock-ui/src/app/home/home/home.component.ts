import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from 'primeng/api';
import { AuthService, UserPayload } from '../../security/auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  username = '';
  password = '';
  loading = false;
  currentUserName = '';
  canRegisterEnterprise = false;
  attemptedLogin = false;

  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {

    if (this.isBrowser) {
      this.checkForAuthError();
    }

    const user: UserPayload | null = this.authService.jwtPayload;
    if (user) {
      this.currentUserName =
        user.name ??
        user.preferred_username ??
        user.sub ??
        '';

      const rolesRaw = user.roles ?? user.authorities;

      const roles: string[] = Array.isArray(rolesRaw)
        ? rolesRaw
        : typeof rolesRaw === 'string'
          ? rolesRaw.split(',').map((r: string) => r.trim())
          : [];

      this.canRegisterEnterprise = roles.includes('ROLE_REGISTER_ENTERPRISE');
    }
  }

  private checkForAuthError(): void {

    if (!this.isBrowser) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error === 'true') {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Login',
        detail: 'E-mail ou senha incorretos. Tente novamente.'
      });

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  async login(): Promise<void> {
    this.attemptedLogin = true;

    if (!this.username || !this.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos'
      });
      return;
    }

    if (!this.isBrowser) return;

    this.loading = true;

    try {
      const codeVerifier = this.authService.generateCodeVerifier();
      this.authService.setInSessionStorage('pkce_code_verifier', codeVerifier);

      const codeChallenge =
        await this.authService.generateCodeChallenge(codeVerifier);

      const redirectUrl =
        `${environment.authServerUrl}/login?` +
        `username=${encodeURIComponent(this.username)}&` +
        `password=${encodeURIComponent(this.password)}&` +
        `code_challenge=${encodeURIComponent(codeChallenge)}&` +
        `code_challenge_method=S256`;

      window.location.href = redirectUrl;

    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro no login. Tente novamente.'
      });
      this.loading = false;
    }
  }

  async demoLogin(): Promise<void> {
    if (!this.isBrowser) return;

    this.authService.setInSessionStorage('IS_DEMO_LOGIN', 'true');

    const codeVerifier = this.authService.generateCodeVerifier();
    this.authService.setInSessionStorage('pkce_code_verifier', codeVerifier);

    const codeChallenge =
      await this.authService.generateCodeChallenge(codeVerifier);

    const url =
      `${environment.authServerUrl}/api/auth/demo-login?` +
      `code_challenge=${encodeURIComponent(codeChallenge)}&` +
      `code_challenge_method=S256`;

    window.location.href = url;
  }

  logout(): void {
    this.authService.logout();

    this.messageService.add({
      severity: 'success',
      summary: 'Logout',
      detail: 'Você saiu com sucesso.'
    });
  }

  goToEnterpriseRegister(): void {
    if (this.canRegisterEnterprise) {
      this.router.navigate(['/enterprise/register']);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso negado',
        detail: 'Você não possui permissão.'
      });
    }
  }

  onFieldInput(): void {
    if (this.attemptedLogin) {
      this.attemptedLogin = false;
    }
  }
}
