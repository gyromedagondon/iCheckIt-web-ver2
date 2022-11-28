import { ArchiveComponent } from './archive/archive.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../app/dashboard-components/dashboard/dashboard.component'
import { LoginComponent } from './auth-components/login/login.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ForgotPasswordComponent } from './auth-components/forgot-password/forgot-password.component';
import { MyProfileComponent } from './my-profile-components/my-profile/my-profile.component';
import { UserManagementComponent } from './user-management-components/user-management/user-management.component';
import { UserComponent } from './user-management-components/user/user.component';
import { TaskComponent } from './dashboard-components/task/task.component';
import { TaskSettingsComponent } from './dashboard-components/task-settings/task-settings.component';
import { ReportComponent } from './dashboard-components/report/report.component';
import { DownloadReportComponent } from './dashboard-components/download-report/download-report.component';
import { VerifyTaskComponent } from './user-management-components/verify-task/verify-task.component';

import { AngularFireAuthGuard, canActivate, customClaims, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserManualComponent } from './user-manual/user-manual.component';
import { ArchivedAccountsComponent } from './user-management-components/archived-accounts/archived-accounts.component';
import { CalendarComponent } from './calendar/calendar.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  { path: 'user-manual', component: UserManualComponent },
  {
    path: 'task/:id',
    component: TaskComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'task/settings/:id',
    component: TaskSettingsComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'task/reports/:id',
    component: ReportComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'task/reports-download/:id',
    component: DownloadReportComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'my-profile',
    component: MyProfileComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'user/:id',
    component: UserComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'user-management/verify-users',
    component: VerifyTaskComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'user-management/archived-accounts',
    component: ArchivedAccountsComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // redirect to `Home`
  { path: 'archive', component: ArchiveComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: '**', component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
