import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MessageService } from 'primeng/api';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  oauthTokenUrl = 'http://localhost:8080/oauth2/token';
  oauthAuthorizeUrl = 'http://localhost:8080/oauth2/authorize';
  jwtPayload: any;

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,

  ) {
    this.loadToken();
  }

  login() {
    const state = 'abc';
    const codeVerifier = 'cstock';

    localStorage.setItem('state', state);
    localStorage.setItem('codeVerifier', codeVerifier);

    const challengeMethod = 'S256'
    const codeChallenge = 'z0Q0t1xK4hFoWMbWbNXsXAnmceL8K5Bj3rcaesrO6oc';

    const redirectURI =
      encodeURIComponent('http://local-cstock.com:8000/authorized');

    const clientId = 'angular'
    const scope = 'read write'
    const responseType = 'code'

    const params = [
      'response_type=' + responseType,
      'client_id=' + clientId,
      'scope=' + scope,
      'code_challenge=' + codeChallenge,
      'code_challenge_method=' + challengeMethod,
      'state=' + state,
      'redirect_uri=' + redirectURI
    ]

    window.location.href = this.oauthAuthorizeUrl + '?' +  params.join('&');


  }

  async getNewAccessTokenWithCode(code: string, state: string): Promise<any> {
    const stateSalvo = localStorage.getItem('state');

    if (stateSalvo !== state) {
      return Promise.reject(null);
    }

    const codeVerifier = localStorage.getItem('codeVerifier')!;

    const payload = new HttpParams()
      .append('grant_type', 'authorization_code')
      .append('code', code)
      .append('redirect_uri', 'http://local-workguru.com:8000/authorized')
      .append('code_verifier', codeVerifier);

    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded')
      .append('Authorization', 'Basic YW5ndWxhcjpAbmd1bEByMA==');

    try {
      const response =
        await this.http.post<any>(this.oauthTokenUrl, payload, { headers })
        .toPromise();
      this.storeToken(response['access_token']);
      this.storeRefreshToken(response['refresh_token']);
      console.log('Novo access token criado!', response);

      localStorage.removeItem('state');
      localStorage.removeItem('codeVerifier');
      return await Promise.resolve();
    } catch (response_1) {
      console.error('Erro ao gerar o token com o code.', response_1);
      return await Promise.resolve();
    }
  }

  async getNewAccessToken(): Promise<void> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded')
      .append('Authorization', 'Basic YW5ndWxhcjpAbmd1bEByMA==');

    const payload = new HttpParams()
      .append('grant_type', 'refresh_token')
      .append('refresh_token', localStorage.getItem('refreshToken')!)

    try {
      const response = await this.http.post<any>(this.oauthTokenUrl, payload,
        { headers })
        .toPromise();
      this.storeToken(response['access_token']);
      this.storeRefreshToken(response['refresh_token']);
      console.log('Novo access token criado!');
      return await Promise.resolve();
    } catch (response_1) {
      console.error('Erro ao renovar token.', response_1);
      return await Promise.resolve();
    }
  }

  public storeToken(token: string) {
    this.jwtPayload = this.jwtHelper.decodeToken(token);
    console.log(this.jwtPayload);

    localStorage.setItem('token', token);
  }

  public loadToken() {
    const token = localStorage.getItem('token');

    if (token) {
      this.storeToken(token);
    }
  }

  private storeRefreshToken(refreshToken: string) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  isInvalidAccessToken() {
    const token = localStorage.getItem('token');
    return !token || this.jwtHelper.isTokenExpired(token);
  }

  hasPermission(permission: string): boolean {
    return this.jwtPayload && this.jwtPayload.authorities.includes(permission);
  }

  hasAnyPermission(roles: any): boolean {
    for (const role of roles) {
      if (this.hasPermission(role)) {
        return true;
      }
    }
    return false;
  }

  clearAccessToken(): void {
    localStorage.removeItem('token');
    this.jwtPayload = null;
  }

  logout() {
    this.clearAccessToken();
    localStorage.clear();
    window.location.href = 'http://localhost:8080/logout?returnTo=' + 'http://local-cstock.com:8000/';
  }

}
