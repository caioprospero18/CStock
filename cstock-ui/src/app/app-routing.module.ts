import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizedComponent } from './security/authorized/authorized.component';
import { PageNotFoundComponent } from './core/page-not-found.component';
import { NotAuthorizedComponent } from './core/not-authorized.component';
import { AuthGuard } from './security/auth.guard';
import { HomeComponent } from './home/home/home.component';
import { EnterpriseRegisterComponent } from './enterprises/enterprise-register/enterprise-register.component';
import { ProductRegisterComponent } from './products/product-register/product-register.component';
import { ProductsListComponent } from './products/products-list/products-list.component';
import { ProductUpdateComponent } from './products/product-update/product-update.component';
import { UserRegisterComponent } from './users/user-register/user-register.component';
import { UserUpdateComponent } from './users/user-update/user-update.component';
import { EnterpriseUpdateComponent } from './enterprises/enterprise-update/enterprise-update.component';
import { CallbackComponent } from './callback/callback.component';
import { RedirectOauthComponent } from './security/redirect-oauth/redirect-oauth.component';
import { StockEntryComponent } from './stock-movement/stock-entry/stock-entry.component';
import { StockMovementChartComponent } from './stock-movement/stock-movement-chart/stock-movement-chart.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },

  { path: 'callback', component: CallbackComponent },

   { path: 'redirect-oauth', component: RedirectOauthComponent },

  { path: 'enterprises/new', component: EnterpriseRegisterComponent },
  { path: 'users/new', component: UserRegisterComponent },
  { path: 'dashboard/entradas', component: StockMovementChartComponent, data: { type: 'entradas' } },
  { path: 'dashboard/saidas', component: StockMovementChartComponent, data: { type: 'saidas' } },

  {
    path: 'products/:id',
    component: ProductRegisterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_PRODUCT']}
  },
  {
    path: 'products',
    component: ProductsListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_SEARCH_PRODUCT']}
  },
  {
    path: 'products/new',
    component: ProductRegisterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_PRODUCT'] }
  },
  {
    path: 'enterprises/update/:id',
    component: EnterpriseUpdateComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_USER']}
  },
  {
    path: 'users/update/:id',
    component: UserUpdateComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_USER']}
  },
  {
    path: 'products/update/:id',
    component: ProductUpdateComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_PRODUCT']}
  },
  {
    path: 'stockmovements/new',
    component: StockEntryComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_PRODUCT']}
  },

  { path: 'authorized', component: AuthorizedComponent },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: 'not-authorized', component: NotAuthorizedComponent },

  { path: '**', redirectTo: 'page-not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
