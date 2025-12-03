import { Injectable } from '@angular/core';
import { User } from '../core/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../security/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  usersUrl = 'http://localhost:8080/users';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  async findAll(): Promise<User[]> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const isAdmin = this.auth.isAdmin();
      let url = this.usersUrl;

      if (!isAdmin) {
        const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];
        if (enterpriseId) {
          url = `${this.usersUrl}/enterprise/${enterpriseId}`;
        }
      }

      const response = await this.http.get<User[]>(url, { headers }).toPromise();
      return response || [];
    } catch (error) {
      throw error;
    }
  }

  async findByEnterprise(enterpriseId: number): Promise<User[]> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const response = await this.http.get<User[]>(
        `${this.usersUrl}/enterprise/${enterpriseId}`,
        { headers }
      ).toPromise();
      return response || [];
    } catch (error) {
      throw error;
    }
  }

  canModifyUser(targetUser: User): boolean {
    const currentUserPosition = this.auth.jwtPayload?.['position'] || '';
    const targetUserPosition = targetUser.position;

    if (!currentUserPosition) {
      return false;
    }

    const positionHierarchy = ['ADMIN', 'CEO', 'FINANCIAL', 'MANAGER', 'OPERATOR', 'VIEWER'];
    const currentUserIndex = positionHierarchy.indexOf(currentUserPosition);
    const targetUserIndex = positionHierarchy.indexOf(targetUserPosition);

    if (currentUserIndex === -1 || targetUserIndex === -1) {
      return false;
    }

    return currentUserIndex <= targetUserIndex;
  }

  prepareUserForSave(user: User, isEditing: boolean = false): any {
    if (isEditing) {
      return User.toUpdateJson(user);
    } else {
      return User.toCreateJson(user);
    }
  }

  async add(user: User): Promise<User> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const userToSave = this.prepareUserForSave(user, false);
      const response = await this.http.post<User>(this.usersUrl, userToSave, { headers }).toPromise();
      return response!;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<User> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const response = await this.http.get<User>(`${this.usersUrl}/${id}`, { headers }).toPromise();
      if (!response) {
        throw new Error('Usuário não encontrado');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAllActive(): Promise<User[]> {
    return await this.findAll();
  }

  async remove(id: number): Promise<void> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      await this.http.delete(`${this.usersUrl}/${id}`, { headers }).toPromise();
    } catch (error) {
      throw error;
    }
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('ID do usuário é obrigatório para atualização');
    }

    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const userToUpdate = this.prepareUserForSave(user, true);
      const response = await this.http.put<User>(`${this.usersUrl}/${user.id}`, userToUpdate, { headers }).toPromise();
      if (!response) {
        throw new Error('Resposta vazia do servidor');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
}
