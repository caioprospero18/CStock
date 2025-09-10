import { NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { InputTextModule } from "primeng/inputtext";
import { ButtonDirective } from "primeng/button";
import { FormsModule } from '@angular/forms';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../security/auth.service';



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    InputTextModule,
    FormsModule,
    FormsModule,
    ButtonDirective
],
providers: [
  { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
  JwtHelperService,
  AuthService,
  { provide: PLATFORM_ID, useValue: 'browser' }
],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
