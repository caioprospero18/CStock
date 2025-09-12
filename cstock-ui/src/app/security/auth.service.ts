import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface UserPayload {
  name?: string;
  preferred_username?: string;
  sub?: string;
  exp?: number;
  roles?: string[] | string;
  user_id?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authServerUrl = environment.authServerUrl;
  private redirectUri = environment.redirectUri;
  private clientId = environment.clientId;
  private jwtHelper = new JwtHelperService();
  private isBrowser: boolean;
  private userInfoData: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadUserInfo(): Promise<void> {
  this.userInfoData = await this.getUserInfo();
}

get userDisplayName(): string {
  if (this.userInfoData?.name) return this.userInfoData.name;
  if (this.userInfoData?.preferred_username) return this.userInfoData.preferred_username;

  if (this.jwtPayload?.name) return this.jwtPayload.name;
  if (this.jwtPayload?.preferred_username) return this.jwtPayload.preferred_username;
  if (this.jwtPayload?.sub) return this.jwtPayload.sub;

  return 'Usuário';
}

  debugToken() {
  const token = this.getFromSessionStorage('access_token');
  if (token) {
    try {
      const payload = this.jwtHelper.decodeToken(token);
      console.log('🔍 Conteúdo completo do JWT:', payload);
      console.log('📋 Campos disponíveis:', Object.keys(payload));
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
    }
  }
}
  public getFromSessionStorage(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setInSessionStoragePrivate(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  }

  private removeFromSessionStorage(key: string): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }

  private clearSessionStorage(): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.clear();
    } catch {}
  }

  public setInSessionStorage(key: string, value: string): void {
    this.setInSessionStoragePrivate(key, value);
  }


  login(): void {
  if (!this.isBrowser) {
    console.warn('login() chamado em ambiente não-browser');
    return;
  }

  const codeVerifier = this.generateCodeVerifier();
  this.setInSessionStorage('pkce_code_verifier', codeVerifier);

  this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
    const params = new HttpParams()
      .set('response_type', 'code')
      .set('client_id', this.clientId)
      .set('redirect_uri', this.redirectUri)
      .set('scope', 'openid profile read write')
      .set('code_challenge', codeChallenge)
      .set('code_challenge_method', 'S256');

    if (this.isBrowser) {
      window.location.href = `${this.authServerUrl}/oauth2/authorize?${params.toString()}`;
    }
  }).catch(error => {
    console.error('Erro ao gerar code challenge:', error);
  });
}

async getUserInfo(): Promise<any> {
  const token = this.getAccessToken();
  if (!token) {
    console.log('❌ Nenhum token disponível');
    return null;
  }

  try {
    const response = await this.http.get<any>(`${this.authServerUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }).toPromise();

    console.log('✅ UserInfo response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Erro ao buscar UserInfo:');
    if (error.status) {
      console.error(`Status: ${error.status}`);
      console.error(`Mensagem: ${error.error?.error_description || error.message}`);
    }
    return null;
  }
}

async debugUserInfo(): Promise<void> {
  console.log('🔍 Debugando UserInfo endpoint...');

  const token = this.getAccessToken();
  if (!token) {
    console.log('❌ Nenhum token disponível');
    return;
  }

  try {
    const response = await this.http.get<any>(`${this.authServerUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }).toPromise();

    console.log('🎉 UserInfo COMPLETO:', response);
    console.log('📋 TODOS os campos:', Object.keys(response));

    const possibleNameFields = ['name', 'preferred_username', 'given_name', 'family_name', 'full_name', 'username', 'email'];
    possibleNameFields.forEach(field => {
      if (response[field]) {
        console.log(`✅ Campo "${field}":`, response[field]);
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar UserInfo:', error);
  }
}

  async exchangeCodeForToken(code: string, codeVerifier?: string): Promise<void> {
  const verifier = codeVerifier || this.getFromSessionStorage('pkce_code_verifier');

  console.log('=== 🔄 TROCA DE CODE POR TOKEN ===');
  console.log('🔑 Code verifier:', verifier ? 'PRESENTE' : 'AUSENTE');
  console.log('🎯 Authorization code:', code);

  if (!verifier) {
    const errorMsg = 'Code verifier não encontrado na sessionStorage';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }


  const body = new HttpParams()
    .set('grant_type', 'authorization_code')
    .set('code', code)
    .set('redirect_uri', this.redirectUri)
    .set('client_id', this.clientId)
    .set('code_verifier', verifier);

  try {
    console.log('🔄 Enviando requisição para /oauth2/token...');

    const tokenResponse = await this.http
      .post<any>(`${this.authServerUrl}/oauth2/token`, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      })
      .toPromise();


    this.removeFromSessionStorage('pkce_code_verifier');

    if (tokenResponse.access_token) {
      this.setInSessionStorage('access_token', tokenResponse.access_token);
      await this.loadUserInfo();
    }
    if (tokenResponse.access_token) {
      this.setInSessionStorage('access_token', tokenResponse.access_token);
    }
    if (tokenResponse.refresh_token) {
      this.setInSessionStorage('refresh_token', tokenResponse.refresh_token);
    }

    console.log('💾 Tokens armazenados na sessionStorage');

  } catch (error: any) {
    console.error('❌ Erro na troca de token:');

    if (error.status) {
      console.error(`📊 Status: ${error.status}`);
      console.error(`📝 Mensagem: ${error.message}`);
    }

    if (error.error && typeof error.error === 'string') {
      console.error('📄 Resposta (texto):', error.error.substring(0, 300));
    }

    throw error;
  }
}

  logout(): void {
    this.clearSessionStorage();
    this.router.navigate(['/home']);
  }

  get jwtPayload(): UserPayload | null {
    const token = this.getFromSessionStorage('access_token');
    if (!token) return null;
    try {
      return this.jwtHelper.decodeToken(token) as UserPayload;
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getFromSessionStorage('access_token');
    return !!token && !this.jwtHelper.isTokenExpired(token ?? '');
  }

  getAccessToken(): string | null {
    return this.getFromSessionStorage('access_token');
  }

  async getNewAccessToken(): Promise<string | null> {
    const refreshToken = this.getFromSessionStorage('refresh_token');
    if (!refreshToken) return null;

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', this.clientId);

    try {
      const tokenResponse: any = await this.http
        .post(`${this.authServerUrl}/oauth2/token`, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true
        })
        .toPromise();

      if (tokenResponse && tokenResponse.access_token) {
        this.setInSessionStoragePrivate('access_token', tokenResponse.access_token);
      }
      if (tokenResponse && tokenResponse.refresh_token) {
        this.setInSessionStoragePrivate('refresh_token', tokenResponse.refresh_token);
      }

      return tokenResponse.access_token;
    } catch (e) {
      console.error('Erro ao renovar token:', e);
      return null;
    }
  }

  private getFromStorage(key: string): string | null {
  if (!this.isBrowser) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}


  private dec2hex(dec: number): string {
    return ('0' + dec.toString(16)).substr(-2);
  }

  public generateCodeVerifier(): string {
  if (!this.isBrowser) {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  const array = new Uint32Array(56);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

public async generateCodeChallenge(codeVerifier: string): Promise<string> {
  if (!this.isBrowser) {
    return '';
  }
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return this.base64UrlEncode(new Uint8Array(digest));
}

  private base64UrlEncode(array: Uint8Array): string {
    if (!this.isBrowser) return '';
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  public getUserRoles(): string[] {
  const user = this.jwtPayload;
  if (!user || !user.roles) return [];

  if (Array.isArray(user.roles)) {
    return user.roles;
  }

  if (typeof user.roles === 'string') {
    return user.roles.split(',').map((role: string) => role.trim());
  }

  return [];
}

public hasRole(role: string): boolean {
  const roles = this.getUserRoles();
  return roles.includes(role);
}

public isAdmin(): boolean {
  const roles = this.getUserRoles();
  return roles.includes('ROLE_REGISTER_ENTERPRISE')
}
}
