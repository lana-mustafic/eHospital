import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'patients',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Doctor', 'Nurse'] },
        loadComponent: () => import('./features/patients/patients').then(m => m.PatientsComponent)
      },
      {
        path: 'doctors',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/doctors/doctors').then(m => m.DoctorsComponent)
      },
      {
        path: 'appointments',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        loadComponent: () => import('./features/appointments/appointments').then(m => m.AppointmentsComponent)
      },
      {
        path: 'medications',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Doctor'] },
        loadComponent: () => import('./features/medications/medications').then(m => m.Medications)
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/departments/departments').then(m => m.DepartmentsComponent)
      },
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/reports/reports').then(m => m.Reports)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'not-authorized',
    loadComponent: () => import('./features/auth/not-authorized/not-authorized').then(m => m.NotAuthorizedComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
