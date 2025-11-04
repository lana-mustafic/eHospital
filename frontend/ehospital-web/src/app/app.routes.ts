import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'patients', loadComponent: () => import('./features/patients/patients/patients').then(m => m.Patients) },
      { path: 'doctors', loadComponent: () => import('./features/doctors/doctors/doctors').then(m => m.Doctors) },
      { path: 'appointments', loadComponent: () => import('./features/appointments/appointments/appointments').then(m => m.Appointments) },
      { path: 'medications', loadComponent: () => import('./features/medications/medications/medications').then(m => m.Medications) },
      { path: 'departments', loadComponent: () => import('./features/departments/departments/departments').then(m => m.Departments) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports/reports').then(m => m.Reports) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  { path: '**', redirectTo: 'dashboard' }
];
