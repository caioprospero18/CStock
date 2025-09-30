import { StockMovementModule } from './stock-movement/stock-movement.module';
import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';


import { SecurityModule } from './security/security.module';
import { AuthService } from './security/auth.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { HomeModule } from './home/home.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { CStockHttpInterceptor } from './security/cstock-http.interceptor';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CallbackComponent } from './callback/callback.component';
import { OrderRequestModule } from './order-request/order-request.module';
import { EnterprisesModule } from './enterprises/enterprises.module';







@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent
  ],
  imports: [

    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    ProductsModule,
    SecurityModule,
    CoreModule,
    HomeModule,
    UsersModule,
    FormsModule,
    StockMovementModule,
    OrderRequestModule,
    EnterprisesModule

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CStockHttpInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
