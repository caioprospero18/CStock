import { Injectable } from '@angular/core';
import { User } from '../core/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  usersUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) { }

  add(user: User): Promise<User> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    return this.http.post<any>(this.usersUrl, User.toJson(user), { headers })
      .toPromise();
  }

  findAll(): Promise<User[]> {
    return this.http.get<User[]>(this.usersUrl)
      .toPromise()
      .then(response => {
        return response || [];
      });
  }

  findById(id: number): Promise<any> {
    return this.http.get<any>(`${this.usersUrl}/${id}`)
      .toPromise()
      .then(response => {
        return response;
      });
  }

  remove(id: number): Promise<any> {
    return this.http.delete(`${this.usersUrl}/${id}`)
      .toPromise()
      .then(() => null);
  }

  update(user: User): Promise<any> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    return this.http.put<any>(`${this.usersUrl}/${user.id}`, User.toJson(user), { headers })
      .toPromise()
      .then(response => {
        return response;
      });
  }
}
