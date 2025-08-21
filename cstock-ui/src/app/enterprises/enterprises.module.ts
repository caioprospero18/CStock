import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterpriseRegisterComponent } from './enterprise-register/enterprise-register.component';
import { EnterpriseUpdateComponent } from './enterprise-update/enterprise-update.component';



@NgModule({
  declarations: [
    EnterpriseRegisterComponent,
    EnterpriseUpdateComponent
  ],
  imports: [
    CommonModule
  ]
})
export class EnterprisesModule { }
