import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientStateService {

  private clientListUpdated = new Subject<void>();

  clientListUpdated$ = this.clientListUpdated.asObservable();

  notifyClientListUpdate() {
    this.clientListUpdated.next();
  }
}
