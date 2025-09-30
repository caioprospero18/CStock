import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class EnterpriseStateService {
  private enterpriseListUpdated = new Subject<void>();

  enterpriseListUpdated$ = this.enterpriseListUpdated.asObservable();

  notifyEnterpriseListUpdate() {
    this.enterpriseListUpdated.next();
  }
}
