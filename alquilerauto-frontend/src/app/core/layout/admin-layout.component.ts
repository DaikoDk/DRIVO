import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <app-sidebar></app-sidebar>
    <div class="ml-[280px] flex flex-col min-h-screen">
      <app-topbar [pageTitle]="pageTitle()"></app-topbar>
      <main class="flex-1 p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-toast></app-toast>
  `
})
export class AdminLayoutComponent {
  private readonly pageTitles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/vehiculos': 'Vehiculos',
    '/admin/clientes': 'Clientes',
    '/admin/reservas': 'Reservas',
    '/admin/pagos': 'Pagos',
    '/admin/reparaciones': 'Reparaciones',
    '/admin/mantenimientos': 'Mantenimientos',
    '/admin/configuracion': 'Configuracion',
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
