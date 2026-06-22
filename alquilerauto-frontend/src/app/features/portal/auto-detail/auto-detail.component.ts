import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoService } from '../../../core/services/auto.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Auto } from '../../../models';

@Component({
  selector: 'app-auto-detail',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      @if (auto()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="w-full aspect-[16/9] rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
              @if (auto()?.fotoUrl && !erroredImages().has(auto()!.idAuto)) {
                <img [src]="fotoCompleta(auto()?.fotoUrl)" (error)="onImgError(auto()!.idAuto)" alt="{{ auto()?.marca }} {{ auto()?.modelo }}" class="w-full h-full object-cover" />
              } @else {
                <span class="material-symbols-outlined text-8xl text-slate-400">directions_car</span>
              }
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
                    <input class="input-field" id="auto-fecha-inicio" type="date" [min]="today()" [(ngModel)]="fechaInicio" (change)="onFechaInicioChange()" />
                  </div>
                  <div>
                    <label class="input-label" for="auto-hora-inicio">Hora recogida</label>
                    <select class="input-field" id="auto-hora-inicio" [(ngModel)]="horaInicio">
                      @for (h of horas; track h) {
                        <option [value]="h">{{ h }}</option>
                      }
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="input-label" for="auto-fecha-fin">Fecha Fin</label>
                    <input class="input-field" id="auto-fecha-fin" type="date" [min]="today()" [(ngModel)]="fechaFin" />
                    @if (fechaInicio && fechaFin && !fechaFinValida) {
                      <p class="text-red-500 text-xs mt-1">La fecha fin debe ser posterior a la fecha inicio</p>
                    }
                  </div>
                  <div>
                    <label class="input-label" for="auto-hora-fin">Hora devolución</label>
                    <select class="input-field" id="auto-hora-fin" [(ngModel)]="horaFin">
                      @for (h of horas; track h) {
                        <option [value]="h">{{ h }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <label class="input-label">Duración rápida</label>
                  <div class="flex gap-2 flex-wrap">
                    @for (opt of duraciones; track opt.dias) {
                      <button type="button" class="px-3 py-1.5 text-sm rounded-lg font-medium border transition-colors"
                        [class.bg-primary]="duracionSeleccionada() === opt.dias"
                        [class.text-white]="duracionSeleccionada() === opt.dias"
                        [class.border-primary]="duracionSeleccionada() === opt.dias"
                        [class.bg-white]="duracionSeleccionada() !== opt.dias"
                        [class.text-slate-700]="duracionSeleccionada() !== opt.dias"
                        [class.border-slate-300]="duracionSeleccionada() !== opt.dias"
                        (click)="seleccionarDuracion(opt.dias)">{{ opt.label }}</button>
                    }
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

                @if (holdState() === 'idle') {
                  <button class="btn-primary w-full" [disabled]="!canReservar() || loading()" (click)="reservar()">
                    {{ loading() ? 'Reservando...' : 'Reservar Ahora' }}
                  </button>
                }

                @if (holdState() === 'held') {
                  <div class="bg-amber-50 rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-amber-700 font-medium">Completa tu reserva</span>
                      <span class="text-lg font-bold text-amber-600 font-mono">{{ tiempoRestante() }}</span>
                    </div>
                    @if (showBufferWarning()) {
                      <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                        <p class="text-xs text-amber-800 font-medium">🕐 {{ bufferMensaje() }}</p>
                        <label class="flex items-start gap-2 text-xs text-amber-700 cursor-pointer">
                          <input type="checkbox" [ngModel]="bufferAcepto()" (change)="bufferAcepto.set(!bufferAcepto())" class="mt-0.5 rounded" />
                          Entiendo que el vehiculo podria no estar listo y acepto que me asignen otro similar
                        </label>
                        <div class="flex items-center justify-between gap-2">
                          <button class="text-xs text-slate-500 hover:text-slate-700 font-medium" (click)="cancelarBuffer()">Cancelar</button>
                          <button class="btn-primary text-sm" [disabled]="!bufferAcepto() || bufferTimer() > 0" (click)="confirmarConRiesgo()">
                            Confirmar
                            @if (bufferTimer() > 0) { ({{ bufferTimer() }}s) }
                          </button>
                        </div>
                      </div>
                    } @else {
                      <button class="btn-primary w-full" [disabled]="loading()" (click)="confirmar()">
                        {{ loading() ? 'Confirmando...' : 'Confirmar Reserva' }}
                      </button>
                    }
                    <button class="w-full text-sm text-red-600 hover:text-red-800 font-medium py-1" (click)="cancelarHold()">
                      Cancelar
                    </button>
                  </div>
                }

                @if (holdState() === 'expired') {
                  <div class="bg-red-50 rounded-lg p-4">
                    <p class="text-sm text-red-700">El tiempo de reserva expiró. Intenta nuevamente.</p>
                  </div>
                }

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
export class AutoDetailComponent implements OnInit, OnDestroy {
  readonly auto = signal<Auto | null>(null);
  readonly loading = signal(false);
  readonly msg = signal('');
  readonly isError = signal(false);
  readonly holdState = signal<'idle' | 'held' | 'expired'>('idle');
  readonly tiempoRestante = signal('');
  private holdTimer: ReturnType<typeof setInterval> | null = null;
  readonly showBufferWarning = signal(false);
  readonly bufferMensaje = signal('');
  readonly bufferAcepto = signal(false);
  readonly bufferTimer = signal(10);
  readonly erroredImages = signal<Set<number>>(new Set());
  private bufferInterval: ReturnType<typeof setInterval> | null = null;

  onImgError(id: number): void {
    this.erroredImages.update(s => { s.add(id); return new Set(s); });
  }

  readonly duracionSeleccionada = signal<number | null>(null);
  readonly duraciones = [
    { dias: 2, label: '2 días' },
    { dias: 5, label: '5 días' },
    { dias: 7, label: '1 semana' },
  ];
  readonly horas = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

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

  fotoCompleta(url?: string | null): string | null {
    return this.autoService.fotoCompleta(url);
  }

  ngOnDestroy(): void {
    this.pararTimer();
    this.pararBufferTimer();
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

  protected get fechaFinValida(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return true;
    return (this.fechaInicio + ' ' + this.horaInicio) < (this.fechaFin + ' ' + this.horaFin);
  }

  canReservar(): boolean {
    if (!(this.fechaInicio && this.fechaFin && this.auto())) return false;
    return this.fechaFinValida;
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private iniciarTimer(fechaExpiracion: string): void {
    this.pararTimer();
    const fin = new Date(fechaExpiracion).getTime();
    const actualizar = () => {
      const restante = Math.max(0, Math.floor((fin - Date.now()) / 1000));
      if (restante <= 0) {
        this.holdState.set('expired');
        this.tiempoRestante.set('00:00');
        this.pararTimer();
        return;
      }
      const min = Math.floor(restante / 60);
      const seg = restante % 60;
      this.tiempoRestante.set(`${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`);
    };
    actualizar();
    this.holdTimer = setInterval(actualizar, 1000);
  }

  private pararTimer(): void {
    if (this.holdTimer) { clearInterval(this.holdTimer); this.holdTimer = null; }
  }

  private pararBufferTimer(): void {
    if (this.bufferInterval) { clearInterval(this.bufferInterval); this.bufferInterval = null; }
  }

  cancelarBuffer(): void {
    this.pararBufferTimer();
    this.showBufferWarning.set(false);
    this.bufferMensaje.set('');
    this.bufferAcepto.set(false);
    this.bufferTimer.set(10);
  }

  confirmarConRiesgo(): void {
    this.pararBufferTimer();
    this.showBufferWarning.set(false);
    this.doCreate();
  }

  confirmar(): void {
    this.loading.set(true);
    this.msg.set('');
    this.reservaService.bufferCheck(this.auto()!.idAuto, this.fechaInicio, this.horaInicio).subscribe({
      next: (res) => {
        console.log('bufferCheck portal:', res);
        this.loading.set(false);
        if (res.riesgo && res.fechaFinAnterior && res.horaFinAnterior) {
          const finAnterior = new Date(`${res.fechaFinAnterior}T${res.horaFinAnterior}`);
          const inicioSeguro = new Date(finAnterior.getTime() + 24 * 60 * 60 * 1000);
          this.fechaInicio = inicioSeguro.toISOString().split('T')[0];
          this.horaInicio = res.horaFinAnterior;
          this.bufferMensaje.set(res.mensaje!);
          this.bufferAcepto.set(false);
          this.bufferTimer.set(10);
          this.pararBufferTimer();
          this.bufferInterval = setInterval(() => {
            this.bufferTimer.update(v => { if (v <= 1) { this.pararBufferTimer(); return 0; } return v - 1; });
          }, 1000);
          this.showBufferWarning.set(true);
        } else {
          this.doCreate();
        }
      },
      error: () => {
        this.loading.set(false);
        this.doCreate();
      }
    });
  }

  doCreate(): void {
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
        this.pararTimer();
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

  cancelarHold(): void {
    this.pararTimer();
    this.autoService.cancelHold(this.auto()!.idAuto).subscribe({
      next: () => {
        this.holdState.set('idle');
        this.tiempoRestante.set('');
      },
      error: (err) => this.msg.set(err.message || 'Error al liberar el auto')
    });
  }

  reservar(): void {
    if (!this.canReservar()) return;
    this.loading.set(true);
    this.msg.set('');
    this.autoService.hold(this.auto()!.idAuto).subscribe({
      next: (res) => {
        this.holdState.set('held');
        this.loading.set(false);
        this.iniciarTimer(res.fechaExpiracion);
      },
      error: (err) => {
        this.msg.set(err.message || 'Error al reservar el auto');
        this.isError.set(true);
        this.loading.set(false);
      }
    });
  }

  seleccionarDuracion(dias: number): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.fechaInicio = manana.toISOString().split('T')[0];
    const fin = new Date(manana);
    fin.setDate(fin.getDate() + dias);
    this.fechaFin = fin.toISOString().split('T')[0];
    this.horaInicio = '08:00';
    this.horaFin = '08:00';
    this.duracionSeleccionada.set(dias);
    this.holdState.set('idle');
    this.pararTimer();
    this.msg.set('');
  }

  onFechaInicioChange(): void {
    this.duracionSeleccionada.set(null);
  }
}
