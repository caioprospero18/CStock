import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Enterprise } from '../core/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private readonly enterprisesUrl = `${environment.apiUrl}/enterprises`;

  constructor(private http: HttpClient) { }

  add(enterprise: Enterprise): Promise<Enterprise> {
    return lastValueFrom(
      this.http.post<Enterprise>(this.enterprisesUrl, Enterprise.toJson(enterprise))
    );
  }

  findAll(): Promise<Enterprise[]> {
    return lastValueFrom(this.http.get<Enterprise[]>(this.enterprisesUrl))
      .then(response => response || [])
      .catch(() => []); // ✅ Erro silencioso
  }

  findById(id: number): Promise<Enterprise> {
    return lastValueFrom(this.http.get<Enterprise>(`${this.enterprisesUrl}/${id}`))
      .then(response => response)
      .catch(error => { throw error; });
  }

  remove(id: number): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.enterprisesUrl}/${id}`));
  }

  update(enterprise: Enterprise): Promise<Enterprise> {
    return lastValueFrom(
      this.http.put<Enterprise>(
        `${this.enterprisesUrl}/${enterprise.id}`,
        Enterprise.toJson(enterprise)
      )
    );
  }
}
