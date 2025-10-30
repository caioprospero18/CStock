import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from '../core/models';
import { AuthService } from '../security/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly clientsUrl = 'http://localhost:8080/clients';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    return new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');
  }

  async findAll(): Promise<Client[]> {
    const headers = this.getHeaders();
    const isAdmin = this.auth.isAdmin();
    let url = this.clientsUrl;

    if (!isAdmin) {
      const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];
      if (enterpriseId) {
        url = `${this.clientsUrl}/enterprise/${enterpriseId}`;
      }
    }

    try {
      const response = await this.http.get<Client[]>(url, { headers }).toPromise();
      return response || [];
    } catch (error) {
      throw error;
    }
  }

  async findByEnterprise(enterpriseId: number): Promise<Client[]> {
    const headers = this.getHeaders();

    try {
      const response = await this.http.get<Client[]>(
        `${this.clientsUrl}/enterprise/${enterpriseId}`,
        { headers }
      ).toPromise();
      return response || [];
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<Client> {
    const headers = this.getHeaders();

    try {
      const response = await this.http.get<Client>(`${this.clientsUrl}/${id}`, { headers }).toPromise();
      if (!response) {
        throw new Error('Cliente não encontrado');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async add(client: Client): Promise<Client> {
    const headers = this.getHeaders();

    try {
      const clientToSend = Client.toJson(client);
      const response = await this.http.post<Client>(this.clientsUrl, clientToSend, { headers }).toPromise();

      if (!response) {
        throw new Error('Resposta vazia do servidor');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(client: Client): Promise<Client> {
    if (!client.id) {
      throw new Error('ID do cliente é obrigatório para atualização');
    }

    const headers = this.getHeaders();

    try {
      const clientToSend = Client.toJson(client);
      const response = await this.http.put<Client>(
        `${this.clientsUrl}/${client.id}`,
        clientToSend,
        { headers }
      ).toPromise();

      if (!response) {
        throw new Error('Resposta vazia do servidor');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const headers = this.getHeaders();

    try {
      await this.http.delete(`${this.clientsUrl}/${id}`, { headers }).toPromise();
    } catch (error) {
      throw error;
    }
  }
}
