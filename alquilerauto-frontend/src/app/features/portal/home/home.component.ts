import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoService } from '../../../core/services/auto.service';
import { Auto } from '../../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <!-- Hero Banner -->
    <section class="relative bg-inverse-surface overflow-hidden">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-600 blur-3xl"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div class="max-w-2xl">
          <h1 class="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Encuentra el auto perfecto para tu viaje
          </h1>
          <p class="text-lg text-slate-300 mb-8">
            Reserva en minutos. Los mejores autos al mejor precio. Sin tramites complicados.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a routerLink="/portal/catalogo" class="btn-primary text-center px-8 py-3 text-base">
              Ver Catalogo
            </a>
            <a routerLink="/register" class="btn-secondary text-center px-8 py-3 text-base bg-white/10 border-white/20 text-white hover:bg-white/20">
              Registrarme
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Como funciona -->
    <section class="max-w-7xl mx-auto px-6 py-20">
      <h2 class="text-3xl font-bold text-slate-800 text-center mb-12">Como funciona</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-primary-on-container">search</span>
          </div>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">1. Busca</h3>
          <p class="text-sm text-slate-500">Explora nuestro catalogo y encuentra el auto ideal para tus necesidades.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 rounded-2xl bg-success-container flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-on-success-container">calendar_month</span>
          </div>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">2. Reserva</h3>
          <p class="text-sm text-slate-500">Elige las fechas, confirma tu reserva y listo. Sin papeleos.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 rounded-2xl bg-warning-container flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-on-warning-container">directions_car</span>
          </div>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">3. Conduce</h3>
          <p class="text-sm text-slate-500">Recoge el auto y disfruta de tu viaje con total tranquilidad.</p>
        </div>
      </div>
    </section>

    <!-- Autos Destacados -->
    <section class="bg-slate-50 py-20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-slate-800">Autos Destacados</h2>
          <a routerLink="/portal/catalogo" class="text-primary font-medium text-sm hover:underline flex items-center gap-1">
            Ver todos <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (auto of destacados(); track auto.idAuto) {
            <div class="card group cursor-pointer" [routerLink]="['/portal/auto', auto.idAuto]">
              <div class="w-full h-40 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                <span class="material-symbols-outlined text-6xl text-slate-400">directions_car</span>
              </div>
              <div class="flex items-start justify-between mb-1">
                <h3 class="text-base font-semibold text-slate-800">{{ auto.marca?.nombre }} {{ auto.modelo?.nombre }}</h3>
                <span class="badge badge-success text-2xs">{{ auto.estado }}</span>
              </div>
              <p class="text-sm text-slate-500 mb-3">{{ auto.anio }} | {{ auto.color || 'N/A' }} | {{ auto.modelo?.categoria || 'S/C' }}</p>
              <div class="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span> {{ auto.modelo?.numeroPasajeros || 5 }}</span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">speed</span> {{ auto.kilometrajeActual.toLocaleString() }} km</span>
              </div>
              <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                <p class="text-xl font-bold text-slate-800">\${{ auto.precioPorDia.toFixed(2) }}<span class="text-xs font-normal text-slate-500"> /dia</span></p>
                <span class="text-primary font-medium text-sm group-hover:underline">Ver detalle</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-7xl mx-auto px-6 py-20 text-center">
      <h2 class="text-3xl font-bold text-slate-800 mb-4">¿Listo para conducir?</h2>
      <p class="text-slate-500 mb-8 max-w-lg mx-auto">Registrate ahora y obten acceso a toda nuestra flota de autos verificados.</p>
      <a routerLink="/register" class="btn-primary px-10 py-3 text-base inline-block">Crear Cuenta Gratis</a>
    </section>
  `
})
export class HomeComponent implements OnInit {
  readonly destacados = signal<Auto[]>([]);

  constructor(private readonly autoService: AutoService) {}

  ngOnInit(): void {
    this.autoService.getDisponibles().subscribe({
      next: (data) => this.destacados.set(data.slice(0, 6)),
      error: () => {}
    });
  }
}
