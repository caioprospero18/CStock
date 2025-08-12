import { ProductService } from './../products/product.service';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { AuthService } from '../security/auth.service';
import { NavbarComponent } from './navbar/navbar.component';

import { ToastModule} from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';
import { NotAuthorizedComponent } from './not-authorized.component';



registerLocaleData(localePt);

@NgModule({
  declarations: [
    NavbarComponent,
    PageNotFoundComponent,
    NotAuthorizedComponent,
  ],
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    RouterModule,
  ],
  exports:[
    NavbarComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [
    AuthService,
    ProductService,
    MessageService,
    ConfirmationService,
    DatePipe,
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
})
export class CoreModule { }
