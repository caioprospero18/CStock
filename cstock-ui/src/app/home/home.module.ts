import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { InputTextModule } from "primeng/inputtext";
import { ButtonDirective } from "primeng/button";



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    InputTextModule,
    ButtonDirective
],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
