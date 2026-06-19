import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="hidden lg:block fixed left-0 top-0 h-screen w-[280px] flex flex-col z-50 bg-inverse-surface" [class.hidden]="collapsed">
      <div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <span class="material-symbols-outlined text-white text-lg">directions_car</span>
        </div>
        <div>
          <p class="text-white font-bold text-lg leading-tight">DRIVO</p>
          <p class="text-slate-400 text-xs leading-tight">Rent-a-Car</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-inverse-surface-on">
            <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="px-3 py-4 border-t border-white/10">
        <a routerLink="/admin/perfil" class="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300">
          <span class="material-symbols-outlined text-xl">account_circle</span>
          <span>Perfil</span>
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() collapsed = false;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Vehículos', icon: 'directions_car', route: '/admin/vehiculos' },
    { label: 'Clientes', icon: 'group', route: '/admin/clientes' },
    { label: 'Reservas', icon: 'calendar_month', route: '/admin/reservas' },
    { label: 'Pagos', icon: 'payments', route: '/admin/pagos' },
    { label: 'Reparaciones', icon: 'build', route: '/admin/reparaciones' },
    { label: 'Mantenimientos', icon: 'engineering', route: '/admin/mantenimientos' },
    { label: 'Configuración', icon: 'settings', route: '/admin/configuracion' },
  ];
}
