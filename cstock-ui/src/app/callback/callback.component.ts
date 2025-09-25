import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../security/auth.service';

@Component({
  selector: 'app-callback',
  template: `
    <div class="callback-container" style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column">
      <h2>Processando login...</h2>
      <div style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;animation:spin 1s linear infinite"></div>
      <p *ngIf="error" style="color:red;margin-top:20px">Erro no login: {{ error }}</p>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
      </style>
    </div>
  `
})
export class CallbackComponent implements OnInit {
  error: string | null = null;
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) {
      return;
    }

    this.route.queryParams.subscribe(async params => {
      const code = params['code'];
      const error = params['error'];

      if (error) {
        this.error = error;
        setTimeout(() => this.router.navigate(['/home']), 3000);
        return;
      }

      if (code) {
        try {
          const verifier = this.authService.getFromSessionStorage('pkce_code_verifier');

          if (!verifier) {
            this.error = 'Sessão expirada. Faça login novamente.';
            setTimeout(() => this.router.navigate(['/home']), 2500);
            return;
          }

          await this.authService.exchangeCodeForToken(code);

          this.router.navigate(['/products']);

        } catch (err) {
          this.error = 'Falha na autenticação';
          setTimeout(() => this.router.navigate(['/home']), 3000);
        }
      } else {
        this.router.navigate(['/home']);
      }
    });
  }
}
