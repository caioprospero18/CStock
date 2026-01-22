import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface UserPayload {
  name?: string;
  preferred_username?: string;
  sub?: string;
  exp?: number;

  roles?: string[] | string;
  authorities?: string[] | string;

  user_id?: number;
  enterprise_id?: number;

  position?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  userDisplayName: string | null = null;
  jwtPayload: UserPayload | null = null;
  private userPayload: UserPayload | null = null;

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadUserFromToken();
    }
  }


  login(): void {
    if (!this.isBrowser) return;

    const codeVerifier = this.generateCodeVerifier();
    this.setInSessionStorage('pkce_code_verifier', codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const params = new HttpParams({
        fromObject: {
          response_type: 'code',
          client_id: environment.clientId,
          redirect_uri: environment.redirectUri,
          scope: 'openid profile',
          code_challenge: codeChallenge,
          code_challenge_method: 'S256'
        }
      });

      window.location.href =
        `${environment.authServerUrl}/oauth2/authorize?${params.toString()}`;
    });
  }

  logout(): void {
    if (!this.isBrowser) return;

    sessionStorage.clear();
    localStorage.clear();
    this.userPayload = null;
    this.userDisplayName = null;

    window.location.href = '/';
  }


  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;

    const token = this.getAccessToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload?.exp) return false;

    return Date.now() < payload.exp * 1000;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  hasRole(role: string): boolean {
    const roles = this.userPayload?.roles;
    const authorities = this.userPayload?.authorities;

    return (
      (Array.isArray(roles) && roles.includes(role)) ||
      (Array.isArray(authorities) && authorities.includes(role)) ||
      false
    );
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  async getNewAccessToken(): Promise<string | null> {
    if (!this.isBrowser) return null;

    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    const response: any = await this.http.post(
      `${environment.apiUrl}/oauth/token/refresh`,
      { refreshToken }
    ).toPromise();

    this.storeTokens(response);
    return response.access_token;
  }

  async exchangeCodeForToken(code: string): Promise<void> {
    if (!this.isBrowser) return;

    const codeVerifier = this.getFromSessionStorage('pkce_code_verifier');

    const body = new HttpParams({
      fromObject: {
        grant_type: 'authorization_code',
        client_id: environment.clientId,
        redirect_uri: environment.redirectUri,
        code,
        code_verifier: codeVerifier
      }
    });

    const response: any = await this.http.post(
      `${environment.authServerUrl}/oauth2/token`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).toPromise();

    this.storeTokens(response);
  }

  private storeTokens(response: any): void {
    if (!this.isBrowser) return;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.access_token);

    if (response.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    }

    this.loadUserFromToken();
  }


  private loadUserFromToken(): void {
    if (!this.isBrowser) return;

    const token = this.getAccessToken();
    if (!token) {
      this.userPayload = null;
      this.jwtPayload = null;
      this.userDisplayName = null;
      return;
    }

    const payload = this.decodeToken(token);
    if (!payload) return;

    this.userPayload = payload;
    this.jwtPayload = payload;

    this.userDisplayName =
      payload.name ||
      payload.preferred_username ||
      payload.sub ||
      null;
  }

  private decodeToken(token: string): UserPayload | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  setInSessionStorage(key: string, value: string): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(key, value);
  }

  getFromSessionStorage(key: string): string {
    if (!this.isBrowser) return '';
    return sessionStorage.getItem(key) ?? '';
  }

  generateCodeVerifier(): string {
    if (!this.isBrowser) return '';
    const array = new Uint32Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(36)).join('');
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    if (!this.isBrowser) return '';

    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
