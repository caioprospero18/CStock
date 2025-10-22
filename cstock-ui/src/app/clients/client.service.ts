import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from '../core/models';
import { AuthService } from '../security/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private clientsUrl = 'http://localhost:8080/clients';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  async findAll(): Promise<Client[]> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const response = await this.http.get<Client[]>(this.clientsUrl, { headers }).toPromise();
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async findByEnterprise(enterpriseId: number): Promise<Client[]> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const response = await this.http.get<Client[]>(
        `${this.clientsUrl}/enterprise/${enterpriseId}`,
        { headers }
      ).toPromise();
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar clientes da empresa:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Client> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const response = await this.http.get<Client>(`${this.clientsUrl}/${id}`, { headers }).toPromise();
      if (!response) {
        throw new Error('Cliente não encontrado');
      }
      return response;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  async add(client: Client): Promise<Client> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const clientToSend = Client.toJson(client);
      console.log('📤 Enviando cliente:', clientToSend);

      const response = await this.http.post<Client>(this.clientsUrl, clientToSend, { headers }).toPromise();
      if (!response) {
        throw new Error('Resposta vazia do servidor');
      }
      return response;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  }

  async update(client: Client): Promise<Client> {
    if (!client.id) {
      throw new Error('ID do cliente é obrigatório para atualização');
    }

    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

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
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
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
      await this.http.delete(`${this.clientsUrl}/${id}`, { headers }).toPromise();
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      throw error;
    }
  }
}
