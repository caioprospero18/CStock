import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { ClientListComponent } from './client-list/client-list.component';
import { ClientRegisterComponent } from './client-register/client-register.component';
import { ClientUpdateComponent } from './client-update/client-update.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ClientListComponent,
    ClientRegisterComponent,
    ClientUpdateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    CardModule,
    AutoCompleteModule,
    SharedModule
  ],
  exports: [
    ClientListComponent,
    ClientRegisterComponent,
    ClientUpdateComponent
  ]
})
export class ClientsModule { }
