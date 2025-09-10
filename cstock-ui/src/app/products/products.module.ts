import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRegisterComponent } from './product-register/product-register.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductUpdateComponent } from './product-update/product-update.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';



@NgModule({
  declarations: [
    ProductRegisterComponent,
    ProductsListComponent,
    ProductViewComponent,
    ProductUpdateComponent
  ],
 imports: [
    ConfirmDialogModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    CalendarModule,
    DropdownModule,
    SharedModule,
    RouterModule
  ],
  exports: [
    ProductsListComponent,
    ProductRegisterComponent,
    ProductViewComponent
  ]
})
export class ProductsModule { }
