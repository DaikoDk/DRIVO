import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoService } from '../../../core/services/auto.service';
import { MarcaService } from '../../../core/services/marca.service';
import { Auto, Marca } from '../../../models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold text-slate-800 mb-2">Catalogo de Autos</h1>
      <p class="text-slate-500 mb-8">Explora nuestra flota y encuentra el auto perfecto para ti</p>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filtros -->
        <aside class="lg:w-64 shrink-0">
          <div class="card sticky top-24">
            <h3 class="font-semibold text-slate-800 mb-4">Filtros</h3>
            <div class="space-y-4">
              <div>
                <label class="input-label">Buscar</label>
                <input class="input-field" type="search" [(ngModel)]="searchTerm" placeholder="Placa o modelo..." />
              </div>
              <div>
                <label class="input-label">Marca</label>
                <select class="input-field" [(ngModel)]="filterMarca">
                  <option value="">Todas</option>
                  @for (m of marcas(); track m.idMarca) {
                    <option [value]="m.idMarca">{{ m.nombre }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="input-label">Precio maximo/dia</label>
                <input class="input-field" type="range" min="0" max="500" step="10" [(ngModel)]="filterPrecioMax" />
                <p class="text-xs text-slate-500 mt-1">Hasta \${{ filterPrecioMax() }}</p>
              </div>
              <button class="btn-secondary w-full text-center" (click)="clearFilters()">Limpiar filtros</button>
            </div>
          </div>
        </aside>

        <!-- Grid -->
        <div class="flex-1">
          <p class="text-sm text-slate-500 mb-4">{{ filteredAutos().length }} autos encontrados</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (auto of filteredAutos(); track auto.idAuto) {
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
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span> {{ auto.modelo?.numeroPasajeros || 5 }} pasajeros</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">settings_suggest</span> {{ auto.modelo?.categoria || 'Estandar' }}</span>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                  <p class="text-xl font-bold text-slate-800">\${{ auto.precioPorDia.toFixed(2) }}<span class="text-xs font-normal text-slate-500"> /dia</span></p>
                  <span class="text-primary font-medium text-sm group-hover:underline">Reservar</span>
                </div>
              </div>
            }
            @if (filteredAutos().length === 0) {
              <div class="col-span-full flex flex-col items-center justify-center py-20">
                <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                <p class="text-slate-500">No se encontraron autos con esos filtros</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogoComponent implements OnInit {
  readonly autos = signal<Auto[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly searchTerm = signal('');
  readonly filterMarca = signal<string | number>('');
  readonly filterPrecioMax = signal(500);

  constructor(
    private readonly autoService: AutoService,
    private readonly marcaService: MarcaService
  ) {}

  ngOnInit(): void {
    this.autoService.getDisponibles().subscribe({ next: (d) => this.autos.set(d) });
    this.marcaService.getActivos().subscribe({ next: (d) => this.marcas.set(d) });
  }

  readonly filteredAutos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const marca = this.filterMarca();
    const precioMax = this.filterPrecioMax();
    return this.autos().filter(a => {
      if (term && !a.placa.toLowerCase().includes(term) && !(a.modelo?.nombre || '').toLowerCase().includes(term) && !(a.marca?.nombre || '').toLowerCase().includes(term)) return false;
      if (marca && a.marca?.idMarca !== +marca) return false;
      if (a.precioPorDia > precioMax) return false;
      return true;
    });
  });

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterMarca.set('');
    this.filterPrecioMax.set(500);
  }
}
