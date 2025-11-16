import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'my',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Patient'] },
    loadComponent: () => import('./features/my/layout/my-layout').then(m => m.MyLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/my/home/my-home').then(m => m.MyHomeComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/my/appointments/my-appointments').then(m => m.MyAppointmentsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/my/profile/my-profile').then(m => m.MyProfileComponent)
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
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
