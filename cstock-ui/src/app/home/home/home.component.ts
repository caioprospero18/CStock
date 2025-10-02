import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService, UserPayload } from '../../security/auth.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.checkForAuthError();

    const user: UserPayload | null = this.authService.jwtPayload;
    if (user) {
      this.currentUserName = user.name ?? user.preferred_username ?? user.sub ?? '';

      const rolesRaw = user.roles ?? (user['authorities'] ?? undefined);
      if (Array.isArray(rolesRaw)) {
        this.canRegisterEnterprise = rolesRaw.includes('ROLE_REGISTER_ENTERPRISE');
      } else if (typeof rolesRaw === 'string') {
        this.canRegisterEnterprise = rolesRaw.split(',').map(r => r.trim()).includes('ROLE_REGISTER_ENTERPRISE');
      } else {
        this.canRegisterEnterprise = false;
      }
    }
  }

  private checkForAuthError(): void {
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

    this.loading = true;

    try {
        const codeVerifier = this.authService.generateCodeVerifier();
        const codeChallenge = await this.authService.generateCodeChallenge(codeVerifier);
        this.authService.setInSessionStorage('pkce_code_verifier', codeVerifier);

        const redirectUrl = `http://localhost:8080/login?` +
            `username=${encodeURIComponent(this.username)}&` +
            `password=${encodeURIComponent(this.password)}&` +
            `code_challenge=${encodeURIComponent(codeChallenge)}&` +
            `code_challenge_method=S256`;

        window.location.href = redirectUrl;

    } catch (error) {
        console.error('Login error:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro no login. Tente novamente.'
        });
        this.loading = false;
    }
  }

  private submitFormToSpring(username: string, password: string, codeChallenge: string): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://localhost:8080/login';

    const addHiddenField = (name: string, value: string) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    };

    addHiddenField('username', username);
    addHiddenField('password', password);
    addHiddenField('code_challenge', codeChallenge);
    addHiddenField('code_challenge_method', 'S256');

    console.log('Submetendo form com code_challenge:', codeChallenge);

    document.body.appendChild(form);
    form.submit();
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
