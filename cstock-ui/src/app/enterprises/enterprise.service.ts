import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Enterprise } from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  enterprisesUrl = 'http://localhost:8080/enterprises';

  constructor(private http: HttpClient) { }

    add(enterprise: Enterprise): Promise<Enterprise> {

    return lastValueFrom(this.http.post<Enterprise>(this.enterprisesUrl, enterprise))
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

    findAll(): Promise<Enterprise[]> {
      return lastValueFrom(this.http.get<Enterprise[]>(this.enterprisesUrl))
        .then(response => {
          return response || [];
        });
    }

    findById(id: number): Promise<any> {
      return lastValueFrom(this.http.get<any>(`${this.enterprisesUrl}/${id}`))
        .then(response => {
          return response;
        });
    }

    remove(id: number): Promise<any> {
      return lastValueFrom(this.http.delete(`${this.enterprisesUrl}/${id}`))
        .then(() => null);
    }

     update(enterprise: Enterprise): Promise<any> {

      const headers = new HttpHeaders()
        .append('Content-Type', 'application/json');

      const userJson = Enterprise.toJson(enterprise);

      return lastValueFrom(this.http.put<any>(`${this.enterprisesUrl}/${enterprise.id}`, userJson, { headers }))
        .then(response => {
          return response;
        })
        .catch(error => {
          throw error;
        });
    }
}
