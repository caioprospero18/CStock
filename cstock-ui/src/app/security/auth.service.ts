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
    });
  }

  async getUserInfo(): Promise<any> {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const response = await this.http.get<any>(`${this.authServerUrl}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }).toPromise();

      return response;
    } catch (error: any) {
      return null;
    }
  }

  async exchangeCodeForToken(code: string, codeVerifier?: string): Promise<void> {
    const verifier = codeVerifier || this.getFromSessionStorage('pkce_code_verifier');

    if (!verifier) {
      throw new Error('Code verifier não encontrado na sessionStorage');
    }

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('client_id', this.clientId)
      .set('code_verifier', verifier);

    try {
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
      if (tokenResponse.refresh_token) {
        this.setInSessionStorage('refresh_token', tokenResponse.refresh_token);
      }

    } catch (error: any) {
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
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();

    if (!token) {
      return false;
    }

    try {
      const isExpired = this.jwtHelper.isTokenExpired(token);
      if (isExpired) {
        console.warn('🔐 Token expirado');
        this.removeFromSessionStorage('access_token');
        return false;
      }
      return true;
    } catch (error) {
      console.error('🔐 Erro ao verificar token:', error);
      return false;
    }
  }

  getAccessToken(): string | null {
  const sessionToken = this.getFromSessionStorage('access_token');
  if (sessionToken) {
    console.log('🔐 Token encontrado no sessionStorage');
    return sessionToken;
  }

  if (this.isBrowser) {
    try {
      const localToken = localStorage.getItem('access_token');
      if (localToken) {
        console.log('🔐 Token encontrado no localStorage');
        this.setInSessionStorage('access_token', localToken);
        return localToken;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao acessar localStorage:', error);
    }
  }

  if (this.jwtPayload && this.jwtPayload['access_token']) {
    console.log('🔐 Token encontrado no jwtPayload');
    return this.jwtPayload['access_token'];
  }

  console.warn('🔐 Nenhum token de autenticação encontrado');
  return null;
}



  async getNewAccessToken(): Promise<string | null> {
    const refreshToken = this.getFromSessionStorage('refresh_token');

    if (!refreshToken) {
      return null;
    }

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', this.clientId);

    try {
      const tokenResponse: any = await this.http
        .post(`${this.authServerUrl}/oauth2/token`, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .toPromise();

      if (tokenResponse?.access_token) {
        this.setInSessionStorage('access_token', tokenResponse.access_token);
      }
      if (tokenResponse?.refresh_token) {
        this.setInSessionStorage('refresh_token', tokenResponse.refresh_token);
      }

      return tokenResponse?.access_token || null;

    } catch (error: any) {
      return null;
    }
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
    if (!user || !user.roles) {
      return [];
    }

    let roles: string[];

    if (Array.isArray(user.roles)) {
      roles = user.roles;
    } else if (typeof user.roles === 'string') {
      roles = [user.roles];
    } else {
      roles = [];
    }

    return roles;
  }

  public hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  public isAdmin(): boolean {
    const roles = this.getUserRoles();
    return roles.includes('ROLE_REGISTER_ENTERPRISE');
  }
}
