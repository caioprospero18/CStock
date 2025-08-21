import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRegisterComponent } from './user-register/user-register.component';
import { UserUpdateComponent } from './user-update/user-update.component';



@NgModule({
  declarations: [
    UserRegisterComponent,
    UserUpdateComponent
  ],
  imports: [
    CommonModule
  ]
})
export class UsersModule { }
