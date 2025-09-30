import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {

  private userListUpdated = new Subject<void>();

  userListUpdated$ = this.userListUpdated.asObservable();

  notifyUserListUpdate() {
    this.userListUpdated.next();
  }
}
