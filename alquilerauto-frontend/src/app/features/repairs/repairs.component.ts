import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ReparacionService, ReparacionFormData } from '../../core/services/reparacion.service';
import { ReservaService } from '../../core/services/reserva.service';
import { AutoService } from '../../core/services/auto.service';
import { ToastService } from '../../core/services/toast.service';
import { Reparacion, CatalogoReparacion, Reserva, Auto } from '../../models';

@Component({
  selector: 'app-repairs',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, StatusBadgeComponent, ModalComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Reparaciones</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de reparaciones de la flota</p>
      </div>
      <button class="btn-primary flex items-center gap-2" (click)="openReportModal()">
        <span class="material-symbols-outlined text-lg">build</span>
        Reportar Reparación
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Pendientes" [value]="stats().pendientes" icon="pending_actions" iconBg="#fef3c7" iconColor="#d97706"></app-stat-card>
      <app-stat-card label="En Proceso" [value]="stats().enProceso" icon="progress_activity" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
      <app-stat-card label="Completadas Hoy" [value]="stats().completadasHoy" icon="check_circle" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Costo Mensual" [value]="'S/ ' + stats().costoMensual" icon="payments" iconBg="#ede9fe" iconColor="#7c3aed"></app-stat-card>
    </div>

    <div class="flex items-center gap-4 mb-4">
      <div role="tablist" class="inline-flex rounded-lg border border-slate-200 overflow-hidden">
        <button role="tab" [attr.aria-selected]="activeTab() === 'activas'" class="px-4 py-2 text-sm font-medium transition-colors"
                [class.btn-primary]="activeTab() === 'activas'"
                [class.bg-white]="activeTab() !== 'activas'"
                [class.text-slate-600]="activeTab() !== 'activas'"
                (click)="activeTab.set('activas')">Activas</button>
        <button role="tab" [attr.aria-selected]="activeTab() === 'historial'" class="px-4 py-2 text-sm font-medium transition-colors"
                [class.btn-primary]="activeTab() === 'historial'"
                [class.bg-white]="activeTab() !== 'historial'"
                [class.text-slate-600]="activeTab() !== 'historial'"
                (click)="activeTab.set('historial')">Historial</button>
      </div>
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
              <th class="px-4 py-3 text-left font-medium text-slate-600">Vehículo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Reserva</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Catálogo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Descripción</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Costo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Responsable</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (r of filteredReparaciones(); track r.idReparacion) {
              <tr class="hover:bg-slate-50 cursor-pointer" tabindex="0" [attr.aria-expanded]="expandedId() === r.idReparacion" (click)="toggleExpand(r)" (keyup.enter)="toggleExpand(r)">
                <td class="px-4 py-3 text-slate-700">#{{ r.idReparacion }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.placa }}</td>
                <td class="px-4 py-3 text-slate-700">#{{ r.idReserva }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.descripcionCatalogo || '-' }}</td>
                <td class="px-4 py-3 text-slate-700 max-w-[200px] truncate">{{ r.descripcion }}</td>
                <td class="px-4 py-3 font-medium text-slate-700">S/{{ r.costo.toFixed(2) }}</td>
                <td class="px-4 py-3"><app-status-badge [status]="r.estado" [label]="r.estado"></app-status-badge></td>
                <td class="px-4 py-3">
                  <span class="badge" [class.badge-warning]="r.responsable === 'Cliente'" [class.badge-info]="r.responsable === 'Empresa'" [class.badge-neutral]="!r.responsable">
                    {{ r.responsable || 'Sin asignar' }}
                  </span>
                </td>
              </tr>
              @if (expandedId() === r.idReparacion) {
                <tr>
                  <td colspan="8" class="px-4 py-4 bg-slate-50">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-slate-600 mb-1">Fechas</p>
                        <p class="text-slate-700">Reporte: {{ r.fechaReporte | date:'dd/MM/yy HH:mm' }}</p>
                        <p class="text-slate-700">Inicio: {{ r.fechaInicio ? (r.fechaInicio | date:'dd/MM/yy HH:mm') : 'Pendiente' }}</p>
                        <p class="text-slate-700">Fin: {{ r.fechaFin ? (r.fechaFin | date:'dd/MM/yy HH:mm') : 'Pendiente' }}</p>
                      </div>
                      <div>
                        <p class="font-medium text-slate-600 mb-1">Descripción Completa</p>
                        <p class="text-slate-700">{{ r.descripcion }}</p>
                      </div>
                      <div>
                        <p class="font-medium text-slate-600 mb-1">Estado</p>
                        <button class="btn-sm" [class.btn-primary]="r.estado === 'Pendiente'" [class.btn-secondary]="r.estado !== 'Pendiente'" (click)="$event.stopPropagation(); updateEstado(r, 'En proceso')">En proceso</button>
                        <button class="btn-sm ml-1" [class.btn-primary]="r.estado === 'En proceso'" [class.btn-secondary]="r.estado !== 'En proceso'" (click)="$event.stopPropagation(); updateEstado(r, 'Completada')">Completar</button>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            }
            @if (filteredReparaciones().length === 0) {
              <tr><td colspan="8" class="px-4 py-16 text-center text-slate-400">No hay reparaciones</td></tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>

    <app-modal [open]="showReportModal()" title="Reportar Reparación" (closed)="showReportModal.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label" for="rep-reserva">Reserva *</label>
          <select class="input-field" id="rep-reserva" [(ngModel)]="formData.idReserva" (ngModelChange)="onReservaChange()">
            <option [ngValue]="0" disabled>Seleccionar...</option>
            @for (r of reservas(); track r.idReserva) {
              <option [ngValue]="r.idReserva">#{{ r.idReserva }} - {{ r.nombreCliente }} ({{ r.placa }})</option>
            }
          </select>
        </div>
        <div>
          <label class="input-label" for="rep-vehiculo">Vehículo *</label>
          <select class="input-field" id="rep-vehiculo" [(ngModel)]="formData.idAuto">
            <option [ngValue]="0" disabled>Seleccionar...</option>
            @if (formData.idReserva) {
              @for (r of reservas(); track r.idReserva) {
                @if (r.idReserva === formData.idReserva && r.idAuto) {
                  <option [ngValue]="r.idAuto">{{ r.placa }} - {{ r.marca }} {{ r.modelo }}</option>
                }
              }
            } @else {
              @for (a of autos(); track a.idAuto) {
                <option [ngValue]="a.idAuto">{{ a.placa }} - {{ a.marca }} {{ a.modelo }}</option>
              }
            }
          </select>
        </div>
        <div>
          <label class="input-label" for="rep-catalogo">Catálogo Reparación</label>
          <select class="input-field" id="rep-catalogo" [(ngModel)]="formData.idCatalogoReparacion">
            <option [ngValue]="undefined">Seleccionar...</option>
            @for (c of catalogo(); track c.idCatalogoReparacion) {
              <option [ngValue]="c.idCatalogoReparacion">{{ c.descripcion }} (S/{{ c.costoEstimado }})</option>
            }
          </select>
        </div>
        <div>
          <label class="input-label" for="rep-costo">Costo Estimado *</label>
          <input class="input-field" id="rep-costo" type="number" step="0.01" [(ngModel)]="formData.costo" />
        </div>
        <div>
          <label class="input-label" for="rep-descripcion">Descripción *</label>
          <textarea class="input-field" id="rep-descripcion" rows="3" [(ngModel)]="formData.descripcion" placeholder="Describa la reparación..."></textarea>
        </div>
        <div>
          <label class="input-label">Responsable</label>
          <div class="flex gap-4 mt-1">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" [(ngModel)]="formData.responsable" value="Cliente" /> Cliente
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" [(ngModel)]="formData.responsable" value="Empresa" /> Empresa
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showReportModal.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="reportRepair()">Reportar</button>
        </div>
      </div>
    </app-modal>
  `
})
export class RepairsComponent implements OnInit {
  readonly reparaciones = signal<Reparacion[]>([]);
  readonly catalogo = signal<CatalogoReparacion[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly autos = signal<Auto[]>([]);
  readonly activeTab = signal<'activas' | 'historial'>('activas');
  readonly expandedId = signal<number | null>(null);
  readonly showReportModal = signal(false);

  formData: ReparacionFormData = { idReserva: 0, idAuto: 0, descripcion: '', costo: 0, responsable: 'Cliente' };

  readonly stats = computed(() => {
    const all = this.reparaciones();
    const hoy = new Date().toISOString().split('T')[0];
    const now = new Date();
    const mesActual = now.getMonth();
    const anioActual = now.getFullYear();
    const completadasHoy = all.filter(r =>
      r.estado === 'Completada' && r.fechaFin && r.fechaFin.startsWith(hoy)
    ).length;
    const reparacionesMes = all.filter(r => {
      const f = new Date(r.fechaReporte);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    });
    const costoMensual = reparacionesMes.reduce((s, r) => s + r.costo, 0).toFixed(2);
    return {
      pendientes: all.filter(r => r.estado === 'Pendiente').length,
      enProceso: all.filter(r => r.estado === 'En proceso').length,
      completadasHoy,
      costoMensual,
    };
  });

  readonly filteredReparaciones = computed(() => {
    if (this.activeTab() === 'activas') {
      return this.reparaciones().filter(r => r.estado !== 'Completada');
    }
    return this.reparaciones().filter(r => r.estado === 'Completada');
  });

  constructor(
    private readonly reparacionService: ReparacionService,
    private readonly reservaService: ReservaService,
    private readonly autoService: AutoService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  readonly loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.reparacionService.getAll().subscribe({
      next: (data) => { this.reparaciones.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar reparaciones'); this.loading.set(false); }
    });
    this.reparacionService.getCatalogo().subscribe({
      next: (data) => this.catalogo.set(data),
      error: () => this.toast.error('Error al cargar catalogo')
    });
    this.reservaService.getAll().subscribe({
      next: (data) => this.reservas.set(data),
      error: () => this.toast.error('Error al cargar reservas')
    });
    this.autoService.getAll().subscribe({
      next: (data) => this.autos.set(data),
      error: () => this.toast.error('Error al cargar autos')
    });
  }

  toggleExpand(r: Reparacion): void {
    this.expandedId.set(this.expandedId() === r.idReparacion ? null : r.idReparacion);
  }

  openReportModal(): void {
    this.formData = { idReserva: 0, idAuto: 0, descripcion: '', costo: 0, responsable: 'Cliente' };
    this.showReportModal.set(true);
  }

  onReservaChange(): void {
    const reserva = this.reservas().find(r => r.idReserva === this.formData.idReserva);
    if (reserva?.idAuto) {
      this.formData.idAuto = reserva.idAuto;
      setTimeout(() => this.cdr.detectChanges());
    }
  }

  reportRepair(): void {
    if (!this.formData.idReserva || !this.formData.idAuto || !this.formData.descripcion || !this.formData.costo) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }
    this.reparacionService.create(this.formData).subscribe({
      next: () => {
        this.toast.success('Reparacion reportada');
        this.showReportModal.set(false);
        this.reparacionService.getAll().subscribe({ next: (data) => this.reparaciones.set(data) });
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  updateEstado(r: Reparacion, estado: string): void {
    this.reparacionService.updateEstado(r.idReparacion, estado).subscribe({
      next: () => {
        this.toast.success('Estado actualizado');
        this.reparacionService.getAll().subscribe({ next: (data) => this.reparaciones.set(data) });
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
