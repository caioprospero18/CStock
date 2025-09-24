import { Component, EventEmitter, Output } from '@angular/core';
import { User } from '../../core/models';
import { UserService } from '../user.service';
import { ErrorHandlerService } from '../../core/error-handler.service';

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrl: './user-update.component.css'
})
export class UserUpdateComponent {
  @Output() onUpdate = new EventEmitter<User>();
  @Output() onCancel = new EventEmitter<void>();

  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  loading = false;

  searchId: string = '';
  searchName: string = '';

  positions = [
    {label: 'Administrador', value: 'ADMIN'},
    {label: 'Presidente', value: 'CEO'},
    {label: 'Gerente de Estoque', value: 'MANAGER'},
    {label: 'Operador de Estoque', value: 'OPERATOR'},
    {label: 'Financeiro', value: 'FINANCIAL'},
    {label: 'Usuario Comum', value: 'VIEWER'},
  ];

  constructor(
    private userService: UserService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;

    try {
      const users = await this.userService.findAll();
      const currentEnterpriseId = this.getCurrentUserEnterpriseId();

      this.users = users.filter((user: User) => user.enterprise?.id === currentEnterpriseId);
      this.filteredUsers = [...this.users];
      this.loading = false;
    } catch (error: any) {
      this.errorHandler.handle(error);
      this.loading = false;
    }
  }

  private getCurrentUserEnterpriseId(): number {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.enterpriseId) {
      return currentUser.enterpriseId;
    }

    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        return payload.enterprise_id || payload.enterpriseId || 0;
      } catch (error) {
        return 0;
      }
    }

    return 0;
  }

  autoSelectFromSearch() {
    if (this.filteredUsers.length === 0) {
      return;
    }

    if (this.filteredUsers.length === 1) {
      this.selectedUser = this.filteredUsers[0];
      return;
    }

    if (this.searchId) {
      const exactMatch = this.filteredUsers.find(user =>
        user.id?.toString() === this.searchId
      );
      if (exactMatch) {
        this.selectedUser = exactMatch;
        return;
      }
    }

    if (this.searchName && this.filteredUsers.length > 0) {
      this.selectedUser = this.filteredUsers[0];
    }
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user: User) => {
      const matchesId = this.searchId ?
        user.id?.toString().includes(this.searchId) : true;

      const matchesName = this.searchName ?
        user.userName?.toLowerCase().includes(this.searchName.toLowerCase()) : true;

      return matchesId && matchesName;
    });

    if ((this.searchId || this.searchName) && this.filteredUsers.length > 0) {
      setTimeout(() => this.autoSelectFromSearch(), 100);
    }
  }

  clearFilters() {
    this.searchId = '';
    this.searchName = '';
    this.filteredUsers = [...this.users];
    this.selectedUser = null;
  }

  getPositionLabel(positionValue: string): string {
    const position = this.positions.find(p => p.value === positionValue);
    return position ? position.label : positionValue;
  }

  selectUser() {
    if (this.selectedUser) {
      this.onUpdate.emit(this.selectedUser);
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}
