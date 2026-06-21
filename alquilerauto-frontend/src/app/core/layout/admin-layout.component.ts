import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <div class="flex">
      <app-sidebar class="shrink-0"></app-sidebar>
      <div class="flex flex-col min-h-screen flex-1 min-w-0">
        <app-topbar [pageTitle]="pageTitle()"></app-topbar>
        <main class="flex-1 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
    <app-toast></app-toast>
  `
})
export class AdminLayoutComponent {
  private readonly pageTitles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/vehiculos': 'Vehículos',
    '/admin/clientes': 'Clientes',
    '/admin/reservas': 'Reservas',
    '/admin/pagos': 'Pagos',
    '/admin/reparaciones': 'Reparaciones',
    '/admin/mantenimientos': 'Mantenimientos',
    '/admin/configuracion': 'Configuración',
    '/admin/perfil': 'Mi Perfil',
  };

  readonly pageTitle = signal('Dashboard');

  constructor(router: Router) {
    router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const segments = e.urlAfterRedirects.split('/').filter(s => s);
      const path = '/' + segments.slice(0, 2).join('/');
      this.pageTitle.set(this.pageTitles[path] || 'Dashboard');
    });
  }
}
