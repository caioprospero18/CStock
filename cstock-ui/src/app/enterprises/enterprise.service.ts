import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Enterprise } from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  enterprisesUrl = 'http://localhost:8080/enterprises';

  constructor(private http: HttpClient) { }

  findAll(): Promise<Enterprise[]> {
    return lastValueFrom(this.http.get<Enterprise[]>(this.enterprisesUrl))
      .then(response => {
        return response || [];
      });
  }

  findById(id: number): Promise<Enterprise> {
    return lastValueFrom(this.http.get<Enterprise>(`${this.enterprisesUrl}/${id}`));
  }
}
