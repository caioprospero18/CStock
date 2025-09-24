import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { User } from '../../core/models';
import { UserService } from '../user.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

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
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.loadUser(Number(id));
    }
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
  get editing(): boolean {
    return this.isEditing;
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
      const control = userForm.controls[key];
      if (control.invalid) {
        console.log(`   🚫 ${key}:`, {
          valor: control.value,
          erros: control.errors,
          touched: control.touched,
          untouched: control.untouched
        });
      }
    });

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

    this.userService.remove(this.user.id)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          detail: 'Usuário excluído com sucesso!'
        });
        this.onDelete.emit(this.user.id);
        this.resetForm();
        this.showDeleteConfirm = false;
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
