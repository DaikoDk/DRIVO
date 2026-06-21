import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sticky top-0 h-screen bg-inverse-surface flex flex-col overflow-x-hidden"
           [class.w-[280px]]="!isCollapsed()"
           [class.w-16]="isCollapsed()">

      <button (click)="toggleCollapsed()"
              (mouseenter)="onTooltipEnter('DRIVO', $event)" (mouseleave)="onTooltipLeave()"
              class="flex items-center w-full h-[72px] px-4 py-5 border-b border-white/10 text-left bg-transparent border-0 cursor-pointer select-none shrink-0">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-primary shrink-0">
          <span class="material-symbols-outlined text-xl text-white">directions_car</span>
        </div>
        @if (!isCollapsed()) {
          <div class="ml-3 overflow-hidden whitespace-nowrap">
            <p class="text-white font-bold text-lg leading-tight">DRIVO</p>
            <p class="text-slate-400 text-xs leading-tight">Rent-a-Car</p>
          </div>
        }
      </button>

      <nav class="flex-1 overflow-y-auto py-4 space-y-1 px-3">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
             (mouseenter)="onTooltipEnter(item.label, $event)" (mouseleave)="onTooltipLeave()"
             (dblclick)="toggleCollapsed()"
             class="sidebar-link flex items-center gap-3 pl-2 pr-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-inverse-surface-on group relative">
            <span class="w-6 h-6 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
            </span>
            @if (!isCollapsed()) {
              <span class="overflow-hidden whitespace-nowrap">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <div class="py-4 border-t border-white/10 px-3">
        <a routerLink="/admin/perfil"
           (mouseenter)="onTooltipEnter('Perfil', $event)" (mouseleave)="onTooltipLeave()"
           (dblclick)="toggleCollapsed()"
           class="sidebar-link flex items-center gap-3 pl-2 pr-4 py-2.5 text-sm font-medium rounded-lg text-slate-300">
          <span class="w-6 h-6 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-xl">account_circle</span>
          </span>
          @if (!isCollapsed()) {
            <span class="overflow-hidden whitespace-nowrap">Perfil</span>
          }
        </a>
      </div>
    </aside>

    @if (isCollapsed() && tooltipLabel() && tooltipReady()) {
      <div class="fixed z-50 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none shadow-lg"
           style="background: #1e293b; color: #f1f5f9; transform: translateY(-50%);"
           [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
        {{ tooltipLabel() }}
      </div>
    }
  `
})
export class SidebarComponent implements OnDestroy {
  protected readonly isCollapsed = signal(true);
  private readonly el = inject(ElementRef).nativeElement as HTMLElement;
  private animFrameId = 0;

  protected readonly tooltipLabel = signal<string | null>(null);
  protected readonly tooltipReady = signal(false);
  protected readonly tooltipX = signal(0);
  protected readonly tooltipY = signal(0);
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.clearTooltipTimer();
  }

  protected onTooltipEnter(label: string, event: MouseEvent): void {
    this.clearTooltipTimer();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipX.set(rect.right + 8);
    this.tooltipY.set(rect.top + rect.height / 2);
    this.tooltipLabel.set(label);
    this.tooltipReady.set(false);
    this.tooltipTimer = setTimeout(() => this.tooltipReady.set(true), 1000);
  }

  protected onTooltipLeave(): void {
    this.clearTooltipTimer();
    this.tooltipLabel.set(null);
    this.tooltipReady.set(false);
  }

  private clearTooltipTimer(): void {
    if (this.tooltipTimer !== null) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
  }

  protected toggleCollapsed(): void {
    const aside = this.el.querySelector('aside') as HTMLElement | null;
    if (!aside) return;

    cancelAnimationFrame(this.animFrameId);
    this.animFrameId = 0;

    if (this.isCollapsed()) {
      // Expand: animate 64 -> 280
      const from = aside.offsetWidth;
      aside.style.width = from + 'px';
      this.isCollapsed.set(false);

      const to = 280, duration = 200, start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        aside.style.width = (from + (to - from) * eased) + 'px';

        if (t < 1) {
          this.animFrameId = requestAnimationFrame(step);
        } else {
          aside.style.width = '';
          this.animFrameId = 0;
        }
      };
      this.animFrameId = requestAnimationFrame(step);
    } else {
      // Collapse: instant snap
      aside.style.width = '';
      this.isCollapsed.set(true);
    }
  }

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
