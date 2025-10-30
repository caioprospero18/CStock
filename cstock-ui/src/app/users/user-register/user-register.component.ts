import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Enterprise, User } from '../../core/models';
import { UserService } from '../user.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../security/auth.service';
import { EnterpriseService } from '../../enterprises/enterprise.service';
import { UserStateService } from '../../core/services/user-state.service';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent {
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onUpdateRequest  = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<number>();
  @Input() userInput: any;
  user = new User();
  isEditing = false;
  showDeleteConfirm = false;
  enterprises: Enterprise[] = [];
  canRegisterEnterprise = false;
  loadingEnterprises = false;

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
    private enterpriseService: EnterpriseService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userStateService: UserStateService
  ){}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.loadUser(Number(id));
    }
    this.checkEnterprisePermission();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userInput'] && this.userInput) {
      if (this.userInput.id) {
        this.user = { ...this.userInput };
        this.user.password = ''; 
        this.isEditing = true;
      } else {
        this.user = new User();
        this.isEditing = false;
      }
    }
  }

  private checkEnterprisePermission() {
    this.canRegisterEnterprise = this.authService.hasRole('ROLE_REGISTER_ENTERPRISE');
    if (this.canRegisterEnterprise) {
      this.loadEnterprises();
    }
  }

  get editing(): boolean {
    return this.isEditing;
  }

  private loadEnterprises() {
    this.loadingEnterprises = true;

    this.enterpriseService.findAll()
      .then((enterprises: Enterprise[]) => {
        this.enterprises = enterprises;
        this.loadingEnterprises = false;
      })
      .catch((error: any) => {
        this.errorHandler.handle(error);
        this.loadingEnterprises = false;
      });
  }

  loadUser(id: number) {
    this.userService.findById(id)
      .then((user: User) => {
        this.user = user;
        this.user.password = '';
        this.isEditing = true;
      })
      .catch((error: any) => this.errorHandler.handle(error));
  }

  save(userForm: NgForm) {
    if (userForm.invalid) {
      Object.keys(userForm.controls).forEach(key => {
        userForm.controls[key].markAsTouched();
      });
      return;
    }

    if (this.isEditing) {
      this.updateUser();
    } else {
      this.addUser();
    }
  }

  addUser() {
    this.userService.add(this.user)
      .then((savedUser: any) => {
        this.messageService.add({
          severity: 'success',
          detail: 'Usuário cadastrado com sucesso!'
        });
        this.onSave.emit(savedUser);
        this.resetForm();
        this.userStateService.notifyUserListUpdate();
      })
      .catch((error: any) => {
        this.errorHandler.handle(error);
      });
  }

  updateUser() {
    this.userService.update(this.user)
      .then((updatedUser: any) => {
        this.messageService.add({
          severity: 'success',
          detail: 'Usuário atualizado com sucesso!'
        });
        this.onSave.emit(updatedUser);
        this.resetForm();
        this.userStateService.notifyUserListUpdate();
      })
      .catch((error: any) => {
        this.errorHandler.handle(error);
      });
  }

  private resetForm() {
    this.user = new User();
    this.isEditing = false;
  }

  cancel() {
    this.resetForm();
    this.onCancel.emit();
  }

  showUpdateUserForm(){
    this.onUpdateRequest.emit();
  }

  confirmDelete() {
    this.showDeleteConfirm = true;
  }

  deleteUser() {
    if (!this.user.id) return;

    if (!this.userService.canModifyUser(this.user)) {
        this.messageService.add({
            severity: 'error',
            detail: 'Você não tem permissão para excluir usuários com cargo superior ao seu.'
        });
        this.showDeleteConfirm = false;
        return;
    }

    this.userService.remove(this.user.id)
        .then(() => {
            this.messageService.add({
                severity: 'success',
                detail: 'Usuário excluído com sucesso!'
            });
            this.onDelete.emit(this.user.id);
            this.resetForm();
            this.showDeleteConfirm = false;
            this.userStateService.notifyUserListUpdate();
        })
        .catch((error: any) => {
            this.errorHandler.handle(error);
            this.showDeleteConfirm = false;
        });
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }
}
