import { Routes } from '@angular/router';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },

  // ADMIN routes
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [RoleGuard.forRole('ADMIN')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'vehiculos', loadComponent: () => import('./features/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'clientes', loadComponent: () => import('./features/clients/clients.component').then(m => m.ClientsComponent) },
      { path: 'reservas', loadComponent: () => import('./features/reservations/reservations.component').then(m => m.ReservationsComponent) },
      { path: 'pagos', loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'reparaciones', loadComponent: () => import('./features/repairs/repairs.component').then(m => m.RepairsComponent) },
      { path: 'mantenimientos', loadComponent: () => import('./features/maintenance/maintenance.component').then(m => m.MaintenanceComponent) },
      { path: 'configuracion', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
    ]
  },

  // PORTAL ecommerce routes
  {
    path: 'portal',
    loadComponent: () => import('./core/layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    canActivate: [RoleGuard.forRole('CLIENTE')],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./features/portal/home/home.component').then(m => m.HomeComponent) },
      { path: 'catalogo', loadComponent: () => import('./features/portal/catalogo/catalogo.component').then(m => m.CatalogoComponent) },
      { path: 'auto/:id', loadComponent: () => import('./features/portal/auto-detail/auto-detail.component').then(m => m.AutoDetailComponent) },
      { path: 'mis-reservas', loadComponent: () => import('./features/portal/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent) },
      { path: 'perfil', loadComponent: () => import('./features/portal/perfil/perfil.component').then(m => m.PerfilComponent) },
    ]
  },

  { path: '**', redirectTo: '/login' }
];
