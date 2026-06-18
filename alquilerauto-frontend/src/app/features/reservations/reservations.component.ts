import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ReservaService, ReservaFormData } from '../../core/services/reserva.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AutoService } from '../../core/services/auto.service';
import { ToastService } from '../../core/services/toast.service';
import { Reserva, Cliente, Auto } from '../../models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, StatusBadgeComponent, ModalComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Reservas</h1>
        <p class="text-sm text-slate-500 mt-1">Gestion de reservas y alquileres</p>
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
      <app-stat-card label="Proximas 24h" [value]="statsExtra().proximas24h" icon="schedule" iconBg="#fef3c7" iconColor="#d97706"></app-stat-card>
      <app-stat-card label="Devoluciones Hoy" [value]="statsExtra().devolucionesHoy" icon="assignment_return" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Ingresos Proyectados" [value]="'S/ ' + statsExtra().ingresosProyectados" icon="payments" iconBg="#ede9fe" iconColor="#7c3aed"></app-stat-card>
    </div>

    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-4 py-3 text-left font-medium text-slate-600">ID</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Cliente</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Vehiculo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Inicio</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Fin</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Total</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Entrega</th>
              <th class="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (r of reservas(); track r.idReserva) {
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
                    <button class="btn-sm btn-secondary" (click)="openDetail(r)" title="Ver detalle">
                      <span class="material-symbols-outlined text-sm">visibility</span>
                    </button>
                    @if (r.estado === 'Pendiente') {
                      <button class="btn-sm btn-primary" (click)="iniciarReserva(r)" title="Iniciar">
                        <span class="material-symbols-outlined text-sm">play_circle</span>
                      </button>
                    }
                    @if (r.estado === 'En proceso') {
                      <button class="btn-sm btn-primary" (click)="openFinalizar(r)" title="Finalizar">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                    }
                    @if (r.estado === 'Pendiente') {
                      <button class="btn-sm btn-danger" (click)="cancelarReserva(r)" title="Cancelar">
                        <span class="material-symbols-outlined text-sm">cancel</span>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
            @if (reservas().length === 0) {
              <tr><td colspan="9" class="px-4 py-16 text-center text-slate-400">No hay reservas registradas</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- NEW RESERVATION MODAL -->
    <app-modal [open]="showNewModal()" title="Nueva Reserva" (closed)="showNewModal.set(false)">
      <div class="space-y-4">
        @if (step() === 1) {
          <div>
            <label class="input-label">Seleccionar Cliente *</label>
            <select class="input-field" [(ngModel)]="newData.idCliente">
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
            <label class="input-label">Seleccionar Vehiculo *</label>
            <select class="input-field" [(ngModel)]="newData.idAuto">
              <option [ngValue]="0" disabled>Seleccionar...</option>
              @for (a of vehiculosDisponibles(); track a.idAuto) {
                <option [ngValue]="a.idAuto">{{ a.placa }} - {{ a.marca }} {{ a.modelo }} (S/{{ a.precioPorDia }}/dia)</option>
              }
            </select>
            <div class="flex justify-between mt-4">
              <button class="btn-secondary" (click)="step.set(1)">Atras</button>
              <button class="btn-primary flex items-center gap-2" [disabled]="!newData.idAuto" (click)="step.set(3)">
                Siguiente <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        }
        @if (step() === 3) {
          <div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label">Fecha Inicio *</label>
                <input class="input-field" type="date" [(ngModel)]="newData.fechaInicio" />
              </div>
              <div>
                <label class="input-label">Hora Inicio *</label>
                <input class="input-field" type="time" [(ngModel)]="newData.horaInicio" />
              </div>
              <div>
                <label class="input-label">Fecha Fin *</label>
                <input class="input-field" type="date" [(ngModel)]="newData.fechaFin" />
              </div>
              <div>
                <label class="input-label">Hora Fin *</label>
                <input class="input-field" type="time" [(ngModel)]="newData.horaFin" />
              </div>
            </div>
            <div class="flex justify-between mt-4">
              <button class="btn-secondary" (click)="step.set(2)">Atras</button>
              <button class="btn-primary" (click)="createReserva()" [disabled]="!newData.fechaInicio || !newData.fechaFin">Crear Reserva</button>
            </div>
          </div>
        }
      </div>
    </app-modal>

    <!-- DETAIL MODAL -->
    <app-modal [open]="showDetail()" title="Detalle de Reserva #{{ selectedReserva()?.idReserva }}" (closed)="showDetail.set(false)">
      @if (selectedReserva()) {
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-slate-500">Cliente</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.nombreCliente }}</p>
            </div>
            <div>
              <p class="text-slate-500">Vehiculo</p>
              <p class="font-medium text-slate-800">{{ selectedReserva()?.placa }} - {{ selectedReserva()?.marca }}</p>
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
              <p class="text-slate-500">Estado</p>
              <app-status-badge [status]="selectedReserva()!.estado" [label]="selectedReserva()!.estado"></app-status-badge>
            </div>
            <div>
              <p class="text-slate-500">Costo Total</p>
              <p class="font-medium text-slate-800">S/{{ selectedReserva()!.total.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      }
    </app-modal>

    <!-- FINALIZAR MODAL -->
    <app-modal [open]="showFinalizar()" title="Finalizar Reserva" (closed)="showFinalizar.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label">Kilometraje Final *</label>
          <input class="input-field" type="number" [(ngModel)]="kilometrajeFin" />
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showFinalizar.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="finalizarReserva()">Finalizar</button>
        </div>
      </div>
    </app-modal>
  `
})
export class ReservationsComponent implements OnInit {
  readonly reservas = signal<Reserva[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly vehiculosDisponibles = signal<Auto[]>([]);
  readonly step = signal(1);
  readonly showNewModal = signal(false);
  readonly showDetail = signal(false);
  readonly showFinalizar = signal(false);
  readonly selectedReserva = signal<Reserva | null>(null);
  readonly finalizarTarget = signal<Reserva | null>(null);
  readonly filterDateIni = signal('');
  readonly filterDateFin = signal('');

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

  constructor(
    private readonly reservaService: ReservaService,
    private readonly clienteService: ClienteService,
    private readonly autoService: AutoService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
    this.clienteService.getActivos().subscribe({ next: (d) => this.clientes.set(d) });
    this.autoService.getDisponibles().subscribe({ next: (d) => this.vehiculosDisponibles.set(d) });
  }

  loadReservas(): void {
    this.reservaService.getAll().subscribe({ next: (data) => this.reservas.set(data) });
  }

  openNewModal(): void {
    this.newData = { idCliente: 0, idAuto: 0, fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '' };
    this.step.set(1);
    this.showNewModal.set(true);
  }

  openDetail(r: Reserva): void {
    this.selectedReserva.set(r);
    this.showDetail.set(true);
  }

  openFinalizar(r: Reserva): void {
    this.finalizarTarget.set(r);
    this.kilometrajeFin = r.kilometrajeInicio || 0;
    this.showFinalizar.set(true);
  }

  createReserva(): void {
    if (!this.newData.idCliente || !this.newData.idAuto || !this.newData.fechaInicio || !this.newData.fechaFin) {
      this.toast.warning('Complete todos los campos');
      return;
    }
    this.reservaService.create(this.newData).subscribe({
      next: () => {
        this.toast.success('Reserva creada exitosamente');
        this.showNewModal.set(false);
        this.loadReservas();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  iniciarReserva(r: Reserva): void {
    this.reservaService.iniciar(r.idReserva, 0).subscribe({
      next: () => {
        this.toast.success('Reserva iniciada');
        this.loadReservas();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  finalizarReserva(): void {
    const r = this.finalizarTarget();
    if (!r) return;
    this.reservaService.finalizar(r.idReserva, this.kilometrajeFin).subscribe({
      next: () => {
        this.toast.success('Reserva finalizada');
        this.showFinalizar.set(false);
        this.loadReservas();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  cancelarReserva(r: Reserva): void {
    this.reservaService.cancelar(r.idReserva).subscribe({
      next: () => {
        this.toast.success('Reserva cancelada');
        this.loadReservas();
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
