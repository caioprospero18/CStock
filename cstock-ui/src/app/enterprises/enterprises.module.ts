import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterpriseRegisterComponent } from './enterprise-register/enterprise-register.component';
import { EnterpriseUpdateComponent } from './enterprise-update/enterprise-update.component';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    EnterpriseRegisterComponent,
    EnterpriseUpdateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    SharedModule,
    RouterModule,
    TableModule,
    TooltipModule
  ],
  exports:[
    EnterpriseRegisterComponent,
    EnterpriseUpdateComponent
  ]
})
export class EnterprisesModule { }
