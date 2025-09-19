import { Component, EventEmitter, Output } from '@angular/core';
import { User } from '../../core/models';
import { UserService } from '../user.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
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
  user = new User();
  isEditing = false;

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
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.loadUser(Number(id));
    }
  }

  get editing(): boolean {
    return this.isEditing;
  }

  loadUser(id: number) {
    this.userService.findById(id)
      .then((user: User) => {
        this.user = user;
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

    if (this.editing) {
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
      })
      .catch((error: any) => this.errorHandler.handle(error));
  }

  updateUser() {
    this.userService.update(this.user)
      .then((updatedUser: any) => {
        this.messageService.add({
          severity: 'success',
          detail: 'Usuário atualizado com sucesso!'
        });
        this.onSave.emit(updatedUser);
      })
      .catch((error: any) => this.errorHandler.handle(error));
  }

  cancel() {
    this.onCancel.emit();
  }
}
