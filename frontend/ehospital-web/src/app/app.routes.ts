import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'patients', loadComponent: () => import('./features/patients/patients').then(m => m.PatientsComponent) },
      { path: 'doctors', loadComponent: () => import('./features/doctors/doctors').then(m => m.Doctors) },
      { path: 'appointments', loadComponent: () => import('./features/appointments/appointments').then(m => m.Appointments) },
      { path: 'medications', loadComponent: () => import('./features/medications/medications').then(m => m.Medications) },
      { path: 'departments', loadComponent: () => import('./features/departments/departments').then(m => m.DepartmentsComponent) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports').then(m => m.Reports) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
