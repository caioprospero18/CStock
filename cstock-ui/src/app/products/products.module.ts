import { NgModule, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRegisterComponent } from './product-register/product-register.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductUpdateComponent } from './product-update/product-update.component';

import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

import { RouterModule } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { StockMovementModule } from '../stock-movement/stock-movement.module';
import { OrderRequestModule } from '../order-request/order-request.module';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../shared/shared.module';
import { EnterprisesModule } from '../enterprises/enterprises.module';
import { InputNumberModule } from 'primeng/inputnumber';
import { ClientsModule } from '../clients/clients.module';



@NgModule({
  declarations: [
    ProductRegisterComponent,
    ProductsListComponent,
    ProductUpdateComponent
  ],
 imports: [
    CommonModule,
    ConfirmDialogModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    CalendarModule,
    DropdownModule,
    SharedModule,
    RouterModule,
    StockMovementModule,
    OrderRequestModule,
    UsersModule,
    EnterprisesModule,
    ClientsModule
  ],
  exports: [
    ProductsListComponent,
    ProductRegisterComponent,
    ProductUpdateComponent
  ]
})
export class ProductsModule { }
