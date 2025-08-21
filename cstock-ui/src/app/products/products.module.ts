import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRegisterComponent } from './product-register/product-register.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductUpdateComponent } from './product-update/product-update.component';



@NgModule({
  declarations: [
    ProductRegisterComponent,
    ProductsListComponent,
    ProductViewComponent,
    ProductUpdateComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ProductsModule { }
