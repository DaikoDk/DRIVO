import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <!-- Navbar -->
    <header class="sticky top-0 z-30 border-b border-white/10 bg-inverse-surface">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <a routerLink="/portal/home" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-lg">directions_car</span>
            </div>
            <div>
              <p class="text-white font-bold text-lg leading-tight">DRIVO</p>
              <p class="text-slate-400 text-xs leading-tight">Rent-a-Car</p>
            </div>
          </a>
          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/portal/catalogo" routerLinkActive="bg-white/10" [routerLinkActiveOptions]="{exact:true}" class="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-slate-300 hover:bg-white/10">Catalogo</a>
            <a routerLink="/portal/mis-reservas" routerLinkActive="bg-white/10" class="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-slate-300 hover:bg-white/10">Mis Reservas</a>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <a routerLink="/portal/perfil" class="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
              {{ userInitial() }}
            </div>
            <span class="hidden sm:inline">{{ userName() }}</span>
          </a>
          <button (click)="auth.logout()" class="text-slate-400 hover:text-white transition-colors" title="Cerrar sesion" aria-label="Cerrar sesión">
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido -->
    <main class="min-h-[calc(100vh-8rem)]">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-800 border-t border-slate-700">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-lg">directions_car</span>
              </div>
              <div>
                <p class="text-white font-bold">DRIVO</p>
                <p class="text-slate-400 text-xs">Rent-a-Car</p>
              </div>
            </div>
            <p class="text-sm text-slate-400">Alquiler de autos seguro y confiable. Tu viaje comienza aqui.</p>
          </div>
          <div>
            <h4 class="text-white font-medium mb-3">Enlaces</h4>
            <div class="space-y-2 text-sm">
              <p><a routerLink="/portal/catalogo" class="text-slate-400 hover:text-white">Catalogo</a></p>
              <p><a routerLink="/portal/mis-reservas" class="text-slate-400 hover:text-white">Mis Reservas</a></p>
              <p><a routerLink="/portal/perfil" class="text-slate-400 hover:text-white">Perfil</a></p>
            </div>
          </div>
          <div>
            <h4 class="text-white font-medium mb-3">Contacto</h4>
            <div class="space-y-2 text-sm text-slate-400">
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-base">call</span> +51 999 888 777</p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-base">mail</span> info&#64;drivo.com</p>
            </div>
          </div>
        </div>
        <div class="mt-8 pt-4 border-t border-slate-700 text-center text-xs text-slate-500">
          &copy; {{ currentYear }} DRIVO Rent-a-Car. Todos los derechos reservados.
        </div>
      </div>
    </footer>

    <app-toast></app-toast>
  `
})
export class PortalLayoutComponent {
  readonly auth: AuthService;
  readonly currentYear = new Date().getFullYear();

  readonly pageTitle = signal('');

  constructor(auth: AuthService, router: Router) {
    this.auth = auth;
    router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const titles: Record<string, string> = {
        '/portal/home': 'Inicio',
        '/portal/catalogo': 'Catalogo',
        '/portal/mis-reservas': 'Mis Reservas',
        '/portal/perfil': 'Mi Perfil',
      };
      const key = '/' + e.urlAfterRedirects.split('?')[0].replace(/\/$/, '');
      this.pageTitle.set(titles[key] || '');
    });
  }

  userName(): string {
    return this.auth.currentUser()?.nombre || 'Usuario';
  }

  userInitial(): string {
    return (this.auth.currentUser()?.nombre || 'U').charAt(0).toUpperCase();
  }
}
