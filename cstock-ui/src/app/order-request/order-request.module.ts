import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { OrderRequestService } from './order-request.service';

import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OrderRequestComponent } from './order-request/order-request.component';

@NgModule({
  declarations: [
    OrderRequestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    ButtonModule,
    InputTextareaModule
  ],
  providers: [
    OrderRequestService
  ],
  exports: [
    OrderRequestComponent
  ]
})
export class OrderRequestModule { }
