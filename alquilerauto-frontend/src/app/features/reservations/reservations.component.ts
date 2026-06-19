import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ReservaService, ReservaFormData } from '../../core/services/reserva.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AutoService } from '../../core/services/auto.service';
import { ReparacionService } from '../../core/services/reparacion.service';
import { ToastService } from '../../core/services/toast.service';
import { Reserva, Cliente, Auto, CatalogoReparacion, Reparacion } from '../../models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, StatusBadgeComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Reservas</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de reservas y alquileres</p>
      </div>
      <div class="flex gap-3">
        <input class="input-field w-48" type="date" [(ngModel)]="filterDateIni" />
        <span class="flex items-center text-slate-400">-</span>
        <input class="input-field w-48" type="date" [(ngModel)]="filterDateFin" />
        <button class="btn-primary flex items-center gap-2" (click)="openNewModal()">
          <span class="material-symbols-outlined text-lg">add</span>
          Nueva Reserva
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Reservas Activas" [value]="reservas().filter(r => r.estado !== 'Finalizada' && r.estado !== 'Cancelada').length" icon="calendar_month" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
      <app-stat-card label="Próximas 24h" [value]="statsExtra().proximas24h" icon="schedule" iconBg="#fef3c7" iconColor="#d97706"></app-stat-card>
      <app-stat-card label="Devoluciones Hoy" [value]="statsExtra().devolucionesHoy" icon="assignment_return" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Ingresos Proyectados" [value]="'S/ ' + statsExtra().ingresosProyectados" icon="payments" iconBg="#ede9fe" iconColor="#7c3aed"></app-stat-card>
    </div>

    <div class="card">
      @if (loading()) {
        <div class="space-y-4 p-4">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex gap-4"><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 w-20"></div></div>
          }
        </div>
      } @else {
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-4 py-3 text-left font-medium text-slate-600">ID</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Cliente</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Vehículo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Inicio</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Fin</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Total</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Entrega</th>
              <th class="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (r of filteredReservas(); track r.idReserva) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-700">#{{ r.idReserva }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.nombreCliente }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.placa }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.fechaInicio | date:'dd/MM' }} {{ r.horaInicio }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.fechaFin | date:'dd/MM' }} {{ r.horaFin }}</td>
                <td class="px-4 py-3 font-medium text-slate-700">S/{{ r.total.toFixed(2) }}</td>
                <td class="px-4 py-3"><app-status-badge [status]="r.estado" [label]="r.estado"></app-status-badge></td>
                <td class="px-4 py-3"><app-status-badge [status]="r.estadoEntrega" [label]="r.estadoEntrega"></app-status-badge></td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button class="btn-sm btn-secondary" (click)="openDetail(r)" title="Ver detalle" aria-label="Ver detalle de reserva">
                      <span class="material-symbols-outlined text-sm">visibility</span>
                    </button>
                    @if (r.estado === 'En proceso') {
                      <button class="btn-sm btn-primary" (click)="openFinalizar(r)" title="Finalizar" aria-label="Finalizar reserva">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                    }
                    @if (r.estado !== 'Finalizada' && r.estado !== 'Cancelada') {
                      <button class="btn-sm btn-danger" (click)="cancelarReserva(r)" title="Cancelar" aria-label="Cancelar reserva">
                        <span class="material-symbols-outlined text-sm">cancel</span>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
            @if (filteredReservas().length === 0) {
              <tr><td colspan="9" class="px-4 py-16 text-center text-slate-400">No hay reservas registradas</td></tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>

    <!-- NEW RESERVATION MODAL -->
    <app-modal [open]="showNewModal()" title="Nueva Reserva"
      [headerActionLabel]="holdState() === 'held' ? 'Cancelar' : ''"
      (headerAction)="cancelHold()"
      (closed)="closeNewModal()">
      <div class="space-y-4">
        @if (step() === 1) {
          <div>
            <label class="input-label" for="res-cliente">Seleccionar Cliente *</label>
            <select class="input-field" id="res-cliente" [(ngModel)]="newData.idCliente">
              <option [ngValue]="0" disabled>Seleccionar...</option>
              @for (c of clientes(); track c.idCliente) {
                <option [ngValue]="c.idCliente">{{ c.nombre }} {{ c.apellidoPaterno }} - {{ c.dni }}</option>
              }
            </select>
            <div class="flex justify-end mt-4">
              <button class="btn-primary flex items-center gap-2" [disabled]="!newData.idCliente" (click)="step.set(2)">
                Siguiente <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        }
        @if (step() === 2) {
          <div>
            <label class="input-label" for="res-vehiculo">Seleccionar Vehículo *</label>
            <select class="input-field" id="res-vehiculo" [(ngModel)]="newData.idAuto">
              <option [ngValue]="0" disabled>Seleccionar...</option>
              @for (a of vehiculosDisponibles(); track a.idAuto) {
                <option [ngValue]="a.idAuto">{{ a.placa }} - {{ a.marca }} {{ a.modelo }} (S/{{ a.precioPorDia }}/día)</option>
              }
            </select>
            @if (holdState() === 'held') {
              <div class="mt-3 bg-amber-50 rounded-lg p-3 flex items-center justify-between">
                <span class="text-sm text-amber-700">Auto reservado temporalmente</span>
                <span class="font-mono font-bold text-amber-600">{{ holdTiempo() }}</span>
              </div>
            }
            @if (holdState() === 'expired') {
              <p class="mt-2 text-sm text-red-600">El tiempo expiró. Selecciona otro vehículo.</p>
            }
            <div class="flex justify-between mt-4">
              <button class="btn-secondary" (click)="step.set(1)">Atrás</button>
              <button class="btn-primary flex items-center gap-2" [disabled]="!newData.idAuto || holdState() === 'expired'" (click)="goToStep3()">
                Siguiente <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        }
        @if (step() === 3) {
          <div>
            @if (holdState() === 'held') {
              <div class="mb-4 bg-amber-50 rounded-lg p-3 flex items-center justify-between">
                <span class="text-sm text-amber-700">Tiempo restante para confirmar</span>
                <span class="font-mono font-bold text-amber-600">{{ holdTiempo() }}</span>
              </div>
            }
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label" for="res-fecha-inicio">Fecha Inicio *</label>
                <input class="input-field" id="res-fecha-inicio" type="date" [(ngModel)]="newData.fechaInicio" />
              </div>
              <div>
                <label class="input-label" for="res-hora-inicio">Hora Inicio *</label>
                <input class="input-field" id="res-hora-inicio" type="time" [(ngModel)]="newData.horaInicio" />
              </div>
              <div>
                <label class="input-label" for="res-fecha-fin">Fecha Fin *</label>
                <input class="input-field" id="res-fecha-fin" type="date" [(ngModel)]="newData.fechaFin" />
              </div>
              <div>
                <label class="input-label" for="res-hora-fin">Hora Fin *</label>
                <input class="input-field" id="res-hora-fin" type="time" [(ngModel)]="newData.horaFin" />
              </div>
            </div>
            <div class="flex justify-between mt-4">
              <button class="btn-secondary" (click)="step.set(2)">Atrás</button>
              <button class="btn-primary" (click)="createReserva()" [disabled]="!newData.fechaInicio || !newData.fechaFin || holdState() === 'expired'">Crear Reserva</button>
            </div>
          </div>
        }
      </div>
    </app-modal>

    <!-- DETAIL MODAL -->
    <app-modal [open]="showDetail()" title="Detalle de Reserva #{{ selectedReserva()?.idReserva }}" (closed)="showDetail.set(false)">
      @if (selectedReserva()) {
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p class="text-slate-500">Cliente</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.nombreCliente }}</p>
            </div>
            <div>
              <p class="text-slate-500">Vehículo</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.placa }} - {{ selectedReserva()?.marca }} {{ selectedReserva()?.modelo }}</p>
            </div>
            <div>
              <p class="text-slate-500">Fecha/Hora Inicio</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.fechaInicio }} {{ selectedReserva()?.horaInicio }}</p>
            </div>
            <div>
              <p class="text-slate-500">Fecha/Hora Fin</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.fechaFin }} {{ selectedReserva()?.horaFin }}</p>
            </div>
            <div>
              <p class="text-slate-500">KM Inicial</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.kilometrajeInicio?.toLocaleString() || '-' }}</p>
            </div>
            <div>
              <p class="text-slate-500">KM Final</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.kilometrajeFin?.toLocaleString() || '-' }}</p>
            </div>
            <div>
              <p class="text-slate-500">Estado</p>
              <app-status-badge [status]="selectedReserva()!.estado" [label]="selectedReserva()!.estado"></app-status-badge>
            </div>
            <div>
              <p class="text-slate-500">Estado de Entrega</p>
              <app-status-badge [status]="selectedReserva()!.estadoEntrega" [label]="selectedReserva()!.estadoEntrega"></app-status-badge>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-3">
            <p class="text-sm font-semibold text-slate-700 mb-2">Costos</p>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <p class="text-slate-500">Subtotal</p>
                <p class="font-medium text-slate-800">S/{{ selectedReserva()!.subtotal.toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-slate-500">Mora</p>
                <p class="font-medium text-slate-800" [class.text-error]="(selectedReserva()!.mora || 0) > 0">S/{{ (selectedReserva()!.mora || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-slate-500">Reparaciones</p>
                <p class="font-medium text-slate-800" [class.text-error]="(selectedReserva()!.costoReparaciones || 0) > 0">S/{{ (selectedReserva()!.costoReparaciones || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-slate-500">Total</p>
                <p class="font-semibold text-slate-800">S/{{ selectedReserva()!.total.toFixed(2) }}</p>
              </div>
            </div>
          </div>

          @if (reparacionesDetalle().length > 0) {
            <div class="border-t border-slate-100 pt-3">
              <p class="text-sm font-semibold text-slate-700 mb-2">Reparaciones registradas</p>
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-slate-200">
                      <th class="px-2 py-2 text-left font-medium text-slate-600">ID</th>
                      <th class="px-2 py-2 text-left font-medium text-slate-600">Catálogo</th>
                      <th class="px-2 py-2 text-left font-medium text-slate-600">Descripción</th>
                      <th class="px-2 py-2 text-left font-medium text-slate-600">Costo</th>
                      <th class="px-2 py-2 text-left font-medium text-slate-600">Estado</th>
                      <th class="px-2 py-2 text-left font-medium text-slate-600">Resp.</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (rep of reparacionesDetalle(); track rep.idReparacion) {
                      <tr>
                        <td class="px-2 py-2 text-slate-700">#{{ rep.idReparacion }}</td>
                        <td class="px-2 py-2 text-slate-600">{{ rep.descripcionCatalogo || '-' }}</td>
                        <td class="px-2 py-2 text-slate-700 max-w-[150px] truncate">{{ rep.descripcion }}</td>
                        <td class="px-2 py-2 font-medium text-slate-700">S/{{ rep.costo.toFixed(2) }}</td>
                        <td class="px-2 py-2"><span class="badge" [class.badge-warning]="rep.estado === 'Pendiente'" [class.badge-info]="rep.estado === 'En proceso'" [class.badge-success]="rep.estado === 'Completada'" [class.badge-error]="rep.estado === 'Cancelada'" [class.badge-neutral]="!rep.estado">{{ rep.estado || '-' }}</span></td>
                        <td class="px-2 py-2 text-slate-600">{{ rep.responsable || '-' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (selectedReserva()?.observacionesEntrega) {
            <div class="border-t border-slate-100 pt-3">
              <p class="text-sm font-semibold text-slate-700 mb-1">Observaciones</p>
              <p class="text-sm text-slate-600">{{ selectedReserva()?.observacionesEntrega }}</p>
            </div>
          }
        </div>
      }
    </app-modal>

    <!-- FINALIZAR MODAL -->
    <app-modal [open]="showFinalizar()" title="Finalizar Reserva" (closed)="showFinalizar.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label" for="res-kilometraje-final">Kilometraje Final *</label>
          <input class="input-field" id="res-kilometraje-final" type="number" [(ngModel)]="kilometrajeFin" />
        </div>
        <div>
          <label class="input-label" for="res-estado-entrega">Estado de Entrega *</label>
          <select class="input-field" id="res-estado-entrega" [(ngModel)]="estadoEntrega">
            <option value="Entregado OK">Entregado OK</option>
            <option value="Entregado con daños">Entregado con daños</option>
            <option value="Entregado con retraso">Entregado con retraso</option>
          </select>
        </div>

        @if (estadoEntrega === 'Entregado con daños') {
          <div class="border-t border-slate-100 pt-4">
            <p class="text-sm font-semibold text-slate-700 mb-3">Reparaciones</p>
            @for (item of reparaciones(); track $index) {
              <div class="p-3 rounded-lg bg-slate-50 mb-3">
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs font-medium text-slate-500">Reparación #{{ $index + 1 }}</span>
                  <button type="button" class="text-slate-400 hover:text-error" (click)="removerReparacion($index)" title="Eliminar reparación" aria-label="Eliminar reparación">
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="input-label">Catálogo</label>
                    <select class="input-field" [(ngModel)]="item.idCatalogoReparacion">
                      <option [ngValue]="undefined">Seleccionar...</option>
                      @for (c of catalogoReparaciones(); track c.idCatalogoReparacion) {
                        <option [ngValue]="c.idCatalogoReparacion">{{ c.descripcion }} (S/{{ c.costoEstimado }})</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="input-label">Descripción *</label>
                    <textarea class="input-field" rows="2" [(ngModel)]="item.descripcion" placeholder="Describa la reparación..."></textarea>
                  </div>
                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="input-label">Costo *</label>
                      <input class="input-field" type="number" step="0.01" [(ngModel)]="item.costo" />
                    </div>
                    <div>
                      <label class="input-label">Responsable</label>
                      <select class="input-field" [(ngModel)]="item.responsable">
                        <option value="Cliente">Cliente</option>
                        <option value="Empresa">Empresa</option>
                        <option value="Seguro">Seguro</option>
                      </select>
                    </div>
                    <div>
                      <label class="input-label">Estado</label>
                      <select class="input-field" [(ngModel)]="item.estado">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Completada">Completada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            }
            <button type="button" class="btn-sm btn-secondary w-full" (click)="agregarReparacion()">
              <span class="material-symbols-outlined text-sm">add</span> Agregar reparación
            </button>
          </div>
        }

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showFinalizar.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="finalizarReserva()">Finalizar</button>
        </div>
      </div>
    </app-modal>

    <app-confirm-dialog
      [open]="showCancelConfirm()"
      title="Cancelar Reserva"
      message="¿Está seguro de cancelar esta reserva?"
      confirmLabel="Cancelar Reserva"
      [danger]="true"
      (confirmed)="confirmCancelar()"
      (cancelled)="showCancelConfirm.set(false)">
    </app-confirm-dialog>
  `
})
export class ReservationsComponent implements OnInit, OnDestroy {
  readonly reservas = signal<Reserva[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly vehiculosDisponibles = signal<Auto[]>([]);
  readonly step = signal(1);
  readonly showNewModal = signal(false);
  readonly showDetail = signal(false);
  readonly showFinalizar = signal(false);
  readonly selectedReserva = signal<Reserva | null>(null);
  readonly reparacionesDetalle = signal<Reparacion[]>([]);
  readonly finalizarTarget = signal<Reserva | null>(null);
  readonly showCancelConfirm = signal(false);
  readonly cancelTargetId = signal<number | null>(null);
  readonly filterDateIni = signal('');
  readonly filterDateFin = signal('');
  readonly catalogoReparaciones = signal<CatalogoReparacion[]>([]);
  readonly holdState = signal<'idle' | 'held' | 'expired'>('idle');
  readonly holdTiempo = signal('');
  private holdTimer: ReturnType<typeof setInterval> | null = null;

  readonly statsExtra = computed(() => {
    const all = this.reservas();
    const now = new Date();
    const hoy = now.toISOString().split('T')[0];
    const en24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const proximas24h = all.filter(r =>
      r.estado !== 'Cancelada' && r.estado !== 'Finalizada' &&
      r.fechaInicio >= hoy && r.fechaInicio <= en24h
    ).length;
    const devolucionesHoy = all.filter(r =>
      r.estado === 'En proceso' && r.fechaFin === hoy
    ).length;
    const activas = all.filter(r => r.estado !== 'Finalizada' && r.estado !== 'Cancelada');
    const ingresosProyectados = activas.reduce((s, r) => s + r.total, 0).toFixed(2);
    return { proximas24h, devolucionesHoy, ingresosProyectados };
  });

  newData: ReservaFormData = { idCliente: 0, idAuto: 0, fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '' };
  kilometrajeFin = 0;
  estadoEntrega = 'Entregado OK';
  readonly reparaciones = signal<{ descripcion: string; costo: number; responsable: string; estado: string; idCatalogoReparacion?: number }[]>([]);

  constructor(
    private readonly reservaService: ReservaService,
    private readonly clienteService: ClienteService,
    private readonly autoService: AutoService,
    private readonly reparacionService: ReparacionService,
    private readonly toast: ToastService
  ) {}

  readonly loading = signal(true);

  readonly filteredReservas = computed(() => {
    const ini = this.filterDateIni();
    const fin = this.filterDateFin();
    if (!ini && !fin) return this.reservas();
    return this.reservas().filter(r => {
      if (ini && r.fechaInicio < ini) return false;
      if (fin && r.fechaFin > fin) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loadReservas();
    this.clienteService.getActivos().subscribe({
      next: (d) => this.clientes.set(d),
      error: () => this.toast.error('Error al cargar clientes')
    });
    this.autoService.getDisponibles().subscribe({
      next: (d) => this.vehiculosDisponibles.set(d),
      error: () => this.toast.error('Error al cargar vehiculos')
    });
    this.reparacionService.getCatalogo().subscribe({
      next: (d) => this.catalogoReparaciones.set(d),
      error: () => this.toast.error('Error al cargar catálogo de reparaciones')
    });
  }

  ngOnDestroy(): void {
    this.pararHoldTimer();
  }

  private iniciarHoldTimer(fechaExpiracion: string): void {
    this.pararHoldTimer();
    const fin = new Date(fechaExpiracion).getTime();
    const actualizar = () => {
      const restante = Math.max(0, Math.floor((fin - Date.now()) / 1000));
      if (restante <= 0) {
        this.holdState.set('expired');
        this.holdTiempo.set('00:00');
        this.pararHoldTimer();
        return;
      }
      const min = Math.floor(restante / 60);
      const seg = restante % 60;
      this.holdTiempo.set(`${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`);
    };
    actualizar();
    this.holdTimer = setInterval(actualizar, 1000);
  }

  private pararHoldTimer(): void {
    if (this.holdTimer) { clearInterval(this.holdTimer); this.holdTimer = null; }
  }

  loadReservas(): void {
    this.loading.set(true);
    this.reservaService.getAll().subscribe({
      next: (data) => { this.reservas.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar reservas'); this.loading.set(false); }
    });
  }

  openNewModal(): void {
    this.newData = { idCliente: 0, idAuto: 0, fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '' };
    this.step.set(1);
    this.holdState.set('idle');
    this.holdTiempo.set('');
    this.pararHoldTimer();
    this.autoService.getDisponibles().subscribe({
      next: (d) => this.vehiculosDisponibles.set(d),
      error: () => this.toast.error('Error al cargar vehiculos')
    });
    this.showNewModal.set(true);
  }

  closeNewModal(): void {
    this.pararHoldTimer();
    this.showNewModal.set(false);
  }

  goToStep3(): void {
    if (!this.newData.idAuto) return;
    if (this.holdState() === 'held') {
      this.step.set(3);
      return;
    }
    this.autoService.hold(this.newData.idAuto).subscribe({
      next: (res) => {
        this.holdState.set('held');
        this.iniciarHoldTimer(res.fechaExpiracion);
        this.step.set(3);
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  cancelHold(): void {
    if (!this.newData.idAuto) return;
    this.pararHoldTimer();
    this.autoService.cancelHold(this.newData.idAuto).subscribe({
      next: () => this.closeNewModal(),
      error: (err) => this.toast.error(err.message)
    });
  }

  openDetail(r: Reserva): void {
    this.selectedReserva.set(r);
    this.reparacionesDetalle.set([]);
    this.reparacionService.getByReserva(r.idReserva).subscribe({
      next: (data) => this.reparacionesDetalle.set(data),
      error: () => this.toast.error('Error al cargar reparaciones')
    });
    this.showDetail.set(true);
  }

  openFinalizar(r: Reserva): void {
    this.finalizarTarget.set(r);
    this.kilometrajeFin = r.kilometrajeInicio || 0;
    this.estadoEntrega = 'Entregado OK';
    this.reparaciones.set([]);
    this.showFinalizar.set(true);
  }

  agregarReparacion(): void {
    this.reparaciones.update(arr => [...arr, { descripcion: '', costo: 0, responsable: 'Cliente', estado: 'Pendiente' }]);
  }

  removerReparacion(index: number): void {
    this.reparaciones.update(arr => arr.filter((_, i) => i !== index));
  }

  createReserva(): void {
    if (!this.newData.idCliente || !this.newData.idAuto || !this.newData.fechaInicio || !this.newData.fechaFin) {
      this.toast.warning('Complete todos los campos');
      return;
    }
    this.reservaService.create(this.newData).subscribe({
      next: () => {
        this.toast.success('Reserva creada exitosamente');
        this.pararHoldTimer();
        this.showNewModal.set(false);
        this.loadReservas();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  finalizarReserva(): void {
    const r = this.finalizarTarget();
    if (!r) return;
    if (r.kilometrajeInicio != null && this.kilometrajeFin < r.kilometrajeInicio) {
      this.toast.warning('El kilometraje final debe ser mayor o igual al inicial');
      return;
    }
    if (this.estadoEntrega === 'Entregado con daños') {
      const arr = this.reparaciones();
      const invalid = arr.some(d => !d.descripcion || !d.costo || d.costo <= 0);
      if (arr.length === 0 || invalid) {
        this.toast.warning('Registre al menos una reparación con descripción y costo válido');
        return;
      }
    }
    this.reservaService.finalizar(r.idReserva, this.kilometrajeFin, this.estadoEntrega,
      this.estadoEntrega === 'Entregado con daños' ? this.reparaciones() : []).subscribe({
      next: () => {
        this.toast.success('Reserva finalizada');
        this.showFinalizar.set(false);
        this.loadReservas();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  cancelarReserva(r: Reserva): void {
    this.cancelTargetId.set(r.idReserva);
    this.showCancelConfirm.set(true);
  }

  confirmCancelar(): void {
    const id = this.cancelTargetId();
    if (!id) return;
    this.reservaService.cancelar(id).subscribe({
      next: () => {
        this.toast.success('Reserva cancelada');
        this.showCancelConfirm.set(false);
        this.loadReservas();
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
