import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AutoService } from '../../../core/services/auto.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Auto } from '../../../models';

@Component({
  selector: 'app-auto-detail',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      @if (auto()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Imagenes y specs -->
          <div class="lg:col-span-2">
            <div class="w-full h-64 lg:h-80 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
              <span class="material-symbols-outlined text-8xl text-slate-400">directions_car</span>
            </div>
            <h1 class="text-3xl font-bold text-slate-800 mb-2">{{ auto()?.marca }} {{ auto()?.modelo }} {{ auto()?.anio }}</h1>
            <p class="text-slate-500 mb-6">{{ auto()?.color || 'N/A' }} | Placa: {{ auto()?.placa }}</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="card text-center">
                <span class="material-symbols-outlined text-2xl text-primary mb-2">person</span>
                <p class="text-xs text-slate-500">Pasajeros</p>
                <p class="font-semibold text-slate-800">{{ auto()?.pasajeros ?? 5 }}</p>
              </div>
              <div class="card text-center">
                <span class="material-symbols-outlined text-2xl text-primary mb-2">category</span>
                <p class="text-xs text-slate-500">Categoría</p>
                <p class="font-semibold text-slate-800">{{ auto()?.categoria || 'Estandar' }}</p>
              </div>
              <div class="card text-center">
                <span class="material-symbols-outlined text-2xl text-primary mb-2">speed</span>
                <p class="text-xs text-slate-500">Kilometraje</p>
                <p class="font-semibold text-slate-800">{{ auto()?.kilometrajeActual?.toLocaleString() }} km</p>
              </div>
              <div class="card text-center">
                <span class="material-symbols-outlined text-2xl text-primary mb-2">settings</span>
                <p class="text-xs text-slate-500">Motor</p>
                <p class="font-semibold text-slate-800">{{ auto()?.numeroMotor || 'N/A' }}</p>
              </div>
            </div>

            <div class="card">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">Especificaciones</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="text-slate-500">Chasis:</span> <span class="font-medium text-slate-700">{{ auto()?.numeroChasis || 'N/A' }}</span></div>
                <div><span class="text-slate-500">Mora por día:</span> <span class="font-medium text-slate-700">S/{{ auto()?.moraPorDia?.toFixed(2) }}</span></div>
                <div><span class="text-slate-500">Última revisión:</span> <span class="font-medium text-slate-700">{{ auto()?.ultimaRevisionKm?.toLocaleString() || 'N/A' }} km</span></div>
                <div><span class="text-slate-500">Próxima revisión:</span> <span class="font-medium text-slate-700">{{ auto()?.proximaRevisionKm?.toLocaleString() || 'N/A' }} km</span></div>
              </div>
            </div>
          </div>

          <!-- Panel de reserva -->
          <div>
            <div class="card sticky top-24">
              <div class="mb-4">
                <p class="text-3xl font-bold text-slate-800">S/{{ auto()?.precioPorDia?.toFixed(2) }}</p>
                <p class="text-sm text-slate-500">por día</p>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="input-label" for="auto-fecha-inicio">Fecha Inicio</label>
                    <input class="input-field" id="auto-fecha-inicio" type="date" [min]="today()" [(ngModel)]="fechaInicio" />
                  </div>
                  <div>
                    <label class="input-label" for="auto-hora-inicio">Hora</label>
                    <input class="input-field" id="auto-hora-inicio" type="time" [(ngModel)]="horaInicio" value="08:00" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="input-label" for="auto-fecha-fin">Fecha Fin</label>
                    <input class="input-field" id="auto-fecha-fin" type="date" [min]="today()" [(ngModel)]="fechaFin" />
                  </div>
                  <div>
                    <label class="input-label" for="auto-hora-fin">Hora</label>
                    <input class="input-field" id="auto-hora-fin" type="time" [(ngModel)]="horaFin" value="18:00" />
                  </div>
                </div>

                @if (dias() > 0) {
                  <div class="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-slate-500">S/{{ auto()?.precioPorDia?.toFixed(2) }} x {{ dias() }} días</span>
                      <span class="font-medium text-slate-700">S/{{ (dias() * (auto()?.precioPorDia || 0)).toFixed(2) }}</span>
                    </div>
                    @if (horasExtra() > 0) {
                      <div class="flex justify-between">
                        <span class="text-slate-500">S/{{ (auto()?.precioPorHora || ((auto()?.precioPorDia || 0) / 8)).toFixed(2) }} x {{ horasExtra() }} horas extra</span>
                        <span class="font-medium text-slate-700">S/{{ (horasExtra() * (auto()?.precioPorHora || 0)).toFixed(2) }}</span>
                      </div>
                    }
                    <div class="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                      <span>Total estimado</span>
                      <span class="text-primary">S/{{ totalEstimado().toFixed(2) }}</span>
                    </div>
                  </div>
                }

                <button class="btn-primary w-full" [disabled]="!canReservar() || loading()" (click)="reservar()">
                  {{ loading() ? 'Reservando...' : 'Reservar Ahora' }}
                </button>

                @if (msg()) {
                  <p class="text-sm text-center" [class.text-error]="isError()" [class.text-success]="!isError()">{{ msg() }}</p>
                }
              </div>
            </div>
          </div>
        </div>
      } @else if (loadError()) {
        <div class="flex flex-col items-center justify-center py-20">
          <span class="material-symbols-outlined text-5xl text-red-300 mb-4">error</span>
          <p class="text-red-500 mb-2">{{ loadError() }}</p>
          <a routerLink="/portal/catalogo" class="text-primary font-medium text-sm hover:underline">Volver al catálogo</a>
        </div>
      } @else {
        <div class="flex items-center justify-center py-20">
          <p class="text-slate-400">Cargando...</p>
        </div>
      }
    </div>
  `
})
export class AutoDetailComponent implements OnInit {
  readonly auto = signal<Auto | null>(null);
  readonly loading = signal(false);
  readonly msg = signal('');
  readonly isError = signal(false);

  fechaInicio = '';
  horaInicio = '08:00';
  fechaFin = '';
  horaFin = '18:00';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly autoService: AutoService,
    private readonly reservaService: ReservaService,
    private readonly auth: AuthService,
    private readonly toast: ToastService
  ) {}

  readonly loadError = signal('');

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.autoService.getById(id).subscribe({
      next: (d) => this.auto.set(d),
      error: () => this.loadError.set('No se pudo cargar el vehiculo')
    });
  }

  dias(): number {
    if (!this.fechaInicio || !this.fechaFin) return 0;
    const d1 = new Date(this.fechaInicio);
    const d2 = new Date(this.fechaFin);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff || 1);
  }

  horasExtra(): number {
    if (!this.fechaInicio || !this.fechaFin || !this.horaInicio || !this.horaFin) return 0;
    const start = new Date(`${this.fechaInicio}T${this.horaInicio}`);
    const end = new Date(`${this.fechaFin}T${this.horaFin}`);
    const totalHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const fullDayHours = this.dias() * 24;
    return Math.max(0, totalHours - fullDayHours);
  }

  totalEstimado(): number {
    if (!this.auto()) return 0;
    const base = this.dias() * (this.auto()?.precioPorDia || 0);
    const extra = this.horasExtra() * (this.auto()?.precioPorHora || 0);
    return base + extra;
  }

  canReservar(): boolean {
    if (!(this.fechaInicio && this.fechaFin && this.auto())) return false;
    return this.fechaFin >= this.fechaInicio;
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  reservar(): void {
    if (!this.canReservar()) return;
    if (this.fechaFin < this.fechaInicio) {
      this.msg.set('La fecha fin debe ser posterior a la fecha inicio');
      this.isError.set(true);
      return;
    }
    this.loading.set(true);
    this.msg.set('');

    this.reservaService.createDesdePortal({
      idAuto: this.auto()!.idAuto,
      fechaInicio: this.fechaInicio,
      horaInicio: this.horaInicio,
      fechaFin: this.fechaFin,
      horaFin: this.horaFin,
    }).subscribe({
      next: () => {
        this.toast.success('Reserva creada exitosamente');
        this.router.navigate(['/portal/mis-reservas']);
      },
      error: (err) => {
        this.msg.set(err.message || 'Error al crear reserva');
        this.isError.set(true);
        this.loading.set(false);
      }
    });
  }
}
