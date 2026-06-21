import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MantenimientoService, MantenimientoFormData } from '../../core/services/mantenimiento.service';
import { AutoService } from '../../core/services/auto.service';
import { ToastService } from '../../core/services/toast.service';
import { Mantenimiento, Auto } from '../../models';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Mantenimientos</h1>
        <p class="text-sm text-slate-500 mt-1">Programación y seguimiento de mantenimientos</p>
      </div>
      <button class="btn-primary flex items-center gap-2" (click)="openScheduleModal()">
        <span class="material-symbols-outlined text-lg">engineering</span>
        Programar Mantenimiento
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="En Curso" [value]="stats().enCurso" icon="progress_activity" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
      <app-stat-card label="Completados" [value]="stats().completados" icon="check_circle" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Urgentes" [value]="stats().urgentes" icon="warning" iconBg="#fef3c7" iconColor="#d97706"></app-stat-card>
      <app-stat-card label="Gasto Mensual" [value]="'S/ ' + stats().gastoMensual" icon="payments" iconBg="#ede9fe" iconColor="#7c3aed"></app-stat-card>
    </div>

    <div class="flex items-center gap-4 mb-4">
      <div role="tablist" class="inline-flex rounded-lg border border-slate-200 overflow-hidden">
        <button role="tab" [attr.aria-selected]="activeTab() === 'en-curso'" class="px-4 py-2 text-sm font-medium transition-colors"
                [class.btn-primary]="activeTab() === 'en-curso'"
                [class.bg-white]="activeTab() !== 'en-curso'"
                [class.text-slate-600]="activeTab() !== 'en-curso'"
                (click)="activeTab.set('en-curso')">En curso
          <span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full" [class.bg-blue-100]="activeTab() !== 'en-curso'" [class.bg-white/20]="activeTab() === 'en-curso'">{{ stats().enCurso }}</span>
        </button>
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
              <th class="px-4 py-3 text-left font-medium text-slate-600">Ingreso</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Salida</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Tipo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Costo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Detalle</th>
              <th class="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (m of filteredMantenimientos(); track m.idMantenimiento) {
              <tr class="hover:bg-slate-50 group">
                <td class="px-4 py-3 text-slate-700">#{{ m.idMantenimiento }}</td>
                <td class="px-4 py-3 text-slate-700">{{ m.auto?.placa }} - {{ m.auto?.modelo }}</td>
                <td class="px-4 py-3 text-slate-700">{{ m.fechaIngreso | date:'dd-MM-yyyy' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ m.fechaSalida ? (m.fechaSalida | date:'dd-MM-yyyy') : 'En curso' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ m.tipo }}</td>
                <td class="px-4 py-3 font-medium text-slate-700">S/{{ m.costo.toFixed(2) }}</td>
                <td class="px-4 py-3 text-slate-500 max-w-[200px] truncate">{{ m.detalle || '-' }}</td>
                <td class="px-4 py-3 text-right">
                  @if (!m.fechaSalida) {
                    <button class="btn-sm btn-primary" (click)="finalizarMantenimiento(m)">Finalizar</button>
                  }
                </td>
              </tr>
            }
            @if (filteredMantenimientos().length === 0) {
              <tr><td colspan="8" class="px-4 py-16 text-center text-slate-400">No hay mantenimientos</td></tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>

    <app-modal [open]="showScheduleModal()" title="Programar Mantenimiento" (closed)="showScheduleModal.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label" for="mnt-vehiculo">Vehículo *</label>
          <select class="input-field" id="mnt-vehiculo" [(ngModel)]="formData.idAuto">
            <option [ngValue]="0" disabled>Seleccionar...</option>
            @for (a of autos(); track a.idAuto) {
              <option [ngValue]="a.idAuto">{{ a.placa }} - {{ a.marca }} {{ a.modelo }}</option>
            }
          </select>
        </div>
        <div>
          <label class="input-label" for="mnt-fecha-ingreso">Fecha Ingreso *</label>
          <input class="input-field" id="mnt-fecha-ingreso" type="date" [(ngModel)]="formData.fechaIngreso" />
        </div>
        <div>
          <label class="input-label" for="mnt-tipo">Tipo *</label>
          <select class="input-field" id="mnt-tipo" [(ngModel)]="formData.tipo">
            <option value="" disabled>Seleccionar...</option>
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
            <option value="Revision">Revisión Técnica</option>
          </select>
        </div>
        <div>
          <label class="input-label" for="mnt-costo">Costo *</label>
          <input class="input-field" id="mnt-costo" type="number" step="0.01" [(ngModel)]="formData.costo" />
        </div>
        <div>
          <label class="input-label" for="mnt-detalle">Detalle</label>
          <textarea class="input-field" id="mnt-detalle" rows="3" [(ngModel)]="formData.detalle" placeholder="Describa el mantenimiento..."></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showScheduleModal.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="scheduleMaintenance()">Programar</button>
        </div>
      </div>
    </app-modal>

    <app-confirm-dialog
      [open]="showFinalizarConfirm()"
      title="Finalizar Mantenimiento"
      message="¿Está seguro de finalizar este mantenimiento?"
      confirmLabel="Finalizar"
      [danger]="false"
      (confirmed)="confirmFinalizar()"
      (cancelled)="showFinalizarConfirm.set(false)">
    </app-confirm-dialog>
  `
})
export class MaintenanceComponent implements OnInit {
  readonly mantenimientos = signal<Mantenimiento[]>([]);
  readonly autos = signal<Auto[]>([]);
  readonly activeTab = signal<'en-curso' | 'historial'>('en-curso');
  readonly showScheduleModal = signal(false);
  readonly showFinalizarConfirm = signal(false);
  readonly finalizarTargetId = signal<number | null>(null);

  formData: MantenimientoFormData = { idAuto: 0, fechaIngreso: '', tipo: '', costo: 0 };

  readonly stats = computed(() => {
    const all = this.mantenimientos();
    const now = new Date();
    const mesActual = now.getMonth();
    const anioActual = now.getFullYear();
    const enCurso = all.filter(m => !m.fechaSalida);
    const urgentes = enCurso.filter(m => m.tipo === 'Correctivo').length;
    const mantenimientosMes = all.filter(m => {
      const f = new Date(m.fechaIngreso);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    });
    const gastoMensual = mantenimientosMes.reduce((s, m) => s + m.costo, 0).toFixed(2);
    return {
      enCurso: enCurso.length,
      completados: all.filter(m => m.fechaSalida).length,
      urgentes,
      gastoMensual,
    };
  });

  readonly filteredMantenimientos = computed(() => {
    if (this.activeTab() === 'en-curso') {
      return this.mantenimientos().filter(m => !m.fechaSalida);
    }
    return this.mantenimientos().filter(m => m.fechaSalida);
  });

  constructor(
    private readonly mantenimientoService: MantenimientoService,
    private readonly autoService: AutoService,
    private readonly toast: ToastService
  ) {}

  readonly loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.mantenimientoService.getAll().subscribe({
      next: (data) => { this.mantenimientos.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar mantenimientos'); this.loading.set(false); }
    });
    this.autoService.getAll().subscribe({
      next: (data) => this.autos.set(data),
      error: () => this.toast.error('Error al cargar autos')
    });
  }

  openScheduleModal(): void {
    this.formData = { idAuto: 0, fechaIngreso: new Date().toISOString().split('T')[0], tipo: '', costo: 0 };
    this.showScheduleModal.set(true);
  }

  scheduleMaintenance(): void {
    if (!this.formData.idAuto || !this.formData.fechaIngreso || !this.formData.tipo) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }
    this.mantenimientoService.create(this.formData).subscribe({
      next: () => {
        this.toast.success('Mantenimiento programado');
        this.showScheduleModal.set(false);
        this.mantenimientoService.getAll().subscribe({ next: (data) => this.mantenimientos.set(data) });
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  finalizarMantenimiento(m: Mantenimiento): void {
    this.finalizarTargetId.set(m.idMantenimiento);
    this.showFinalizarConfirm.set(true);
  }

  confirmFinalizar(): void {
    const id = this.finalizarTargetId();
    if (!id) return;
    const fechaSalida = new Date().toISOString().split('T')[0];
    this.mantenimientoService.finalizar(id, fechaSalida).subscribe({
      next: () => {
        this.toast.success('Mantenimiento finalizado');
        this.showFinalizarConfirm.set(false);
        this.finalizarTargetId.set(null);
        this.mantenimientoService.getAll().subscribe({ next: (data) => this.mantenimientos.set(data) });
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
