import { Injectable } from '@angular/core';
import { User } from '../core/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class UserService {

  usersUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) { }

  add(user: User): Promise<User> {

  return lastValueFrom(this.http.post<User>(this.usersUrl, user))
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
}

  findAll(): Promise<User[]> {
    return lastValueFrom(this.http.get<User[]>(this.usersUrl))
      .then(response => {
        return response || [];
      });
  }

  findById(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.usersUrl}/${id}`))
      .then(response => {
        return response;
      });
  }

  remove(id: number): Promise<any> {
    return lastValueFrom(this.http.delete(`${this.usersUrl}/${id}`))
      .then(() => null);
  }

   update(user: User): Promise<any> {

    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    const userJson = User.toUpdateJson(user);

    return lastValueFrom(this.http.put<any>(`${this.usersUrl}/${user.id}`, userJson, { headers }))
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  findByEnterpriseId(enterpriseId: number): Promise<User[]> {
    return lastValueFrom(this.http.get<User[]>(`${this.usersUrl}?enterpriseId=${enterpriseId}`))
      .then(response => {
        return response || [];
      });
  }
}
