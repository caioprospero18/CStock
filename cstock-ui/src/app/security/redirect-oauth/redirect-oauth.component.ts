import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth.service';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-redirect-oauth',
  template: `<div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div style="text-align: center;">
      <h2>Redirecionando para autorização...</h2>
      <p>Por favor, aguarde enquanto iniciamos o fluxo de autenticação.</p>
      <div *ngIf="isBrowser" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  </div>`
})
export class RedirectOauthComponent implements OnInit {
  isBrowser: boolean = false;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (this.isBrowser) {
      await this.initOAuthRedirect();
    }
  }

  private async initOAuthRedirect(): Promise<void> {
    try {
      // RECUPERA o code_verifier que já foi armazenado pelo AuthService
      const codeVerifier = this.storageService.getItem('pkce_code_verifier');

      console.log('Code verifier recuperado no redirect:', codeVerifier);

      if (!codeVerifier) {
        throw new Error('Code verifier não encontrado no storage');
      }

      // Gera o challenge a partir do verifier existente
      const codeChallenge = await this.authService.generateCodeChallenge(codeVerifier);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: 'cstock-ui',
        redirect_uri: 'http://localhost:4200/callback',
        scope: 'openid profile read write',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      const authUrl = `http://localhost:8080/oauth2/authorize?${params.toString()}`;
      console.log('Redirecionando para:', authUrl);

      // Usa assign para manter cookies de sessão
      window.location.assign(authUrl);

    } catch (error) {
      console.error('Erro no redirecionamento OAuth:', error);

      // Em caso de erro, redireciona para home
      setTimeout(() => {
        window.location.href = '/home';
      }, 3000);
    }
  }
}
