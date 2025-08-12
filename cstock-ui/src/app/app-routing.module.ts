import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizedComponent } from './security/authorized/authorized.component';
import { JobsListComponent } from './jobs/jobs-list/jobs-list.component';
import { JobRegisterComponent } from './jobs/job-register/job-register.component';
import { PageNotFoundComponent } from './core/page-not-found.component';
import { NotAuthorizedComponent } from './core/not-authorized.component';
import { AuthGuard } from './security/auth.guard';
import { HomeComponent } from './home/home/home.component';
import { EnterpriseRegisterComponent } from './enterprises/enterprise-register/enterprise-register.component';
import { CandidateRegisterComponent } from './candidates/candidate-register/candidate-register.component';
import { JobViewComponent } from './jobs/job-view/job-view.component';
import { CandidateViewProfileComponent } from './candidates/candidate-view-profile/candidate-view-profile.component';
import { EnterpriseViewProfileComponent } from './enterprises/enterprise-view-profile/enterprise-view-profile.component';
import { EnterpriseUpdateProfileComponent } from './enterprises/enterprise-update-profile/enterprise-update-profile.component';
import { CandidateUpdateProfileComponent } from './candidates/candidate-update-profile/candidate-update-profile.component';
import { GraduationRegisterComponent } from './graduations/graduation-register/graduation-register.component';
import { ProfessionalHistoryRegisterComponent } from './professional-histories/professional-history-register/professional-history-register.component';
import { JobUpdateComponent } from './jobs/job-update/job-update.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent},
  { path: 'enterprises/new', component: EnterpriseRegisterComponent },
  { path: 'enterprises/view/:id', component: EnterpriseViewProfileComponent},
  { path: 'candidates/new', component: CandidateRegisterComponent },
  { path: 'candidates/view/:id', component: CandidateViewProfileComponent},
  {
    path: 'jobs/:id',
    component: JobRegisterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_JOB']}
  },
  {
    path: 'jobs/view/:id',
    component: JobViewComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_SEARCH_JOB']}
  },
  {
    path: 'jobs',
    component: JobsListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_SEARCH_JOB']}
  },
  {
    path: 'jobs/new',
    component: JobRegisterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_JOB'] }
  },
  {
    path: 'apply/:id',
    component: JobViewComponent,
    canActivate: [AuthGuard],
    data: { role: ['ROLE_APPLY_JOB'] }
  },
  {
    path: 'isApplied/:id',
    component: JobViewComponent,
    canActivate: [AuthGuard],
    data: { role: ['ROLE_APPLY_JOB'] }
  },
  {
    path: 'enterprises/update/:id',
    component: EnterpriseUpdateProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_USER']}
  },
  {
    path: 'candidates/update/:id',
    component: CandidateUpdateProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_USER']}
  },
  {
    path: 'jobs/update/:id',
    component: JobUpdateComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REGISTER_JOB']}
  },
  {
    path: 'graduations/new',
    component: GraduationRegisterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_APPLY_JOB'] }
  },
  {
    path: 'professional_histories/new',
    component: ProfessionalHistoryRegisterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_APPLY_JOB'] }
  },

  { path: 'authorized', component: AuthorizedComponent },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: 'not-authorized', component: NotAuthorizedComponent },
  { path: '**', redirectTo: 'page-not-found'} // importante que seja a última rota
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
