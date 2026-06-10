import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfiguracionService, ConfiguracionFormData } from '../../core/services/configuracion.service';
import { ToastService } from '../../core/services/toast.service';
import { Configuracion } from '../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, ModalComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Configuracion</h1>
        <p class="text-sm text-slate-500 mt-1">Parametros del sistema</p>
      </div>
      <button class="btn-primary flex items-center gap-2" (click)="openAddModal()">
        <span class="material-symbols-outlined text-lg">add</span>
        Agregar Configuracion
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Parametros Totales" [value]="configs().length" icon="database" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
      <app-stat-card label="Seguridad" value="Optima" icon="security" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Ultima Sincronizacion" value="5 min" icon="sync" iconBg="#fef3c7" iconColor="#d97706"></app-stat-card>
      <app-stat-card label="Alertas" value="0" icon="info" iconBg="#ede9fe" iconColor="#7c3aed"></app-stat-card>
    </div>

    <div class="card">
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex gap-4">
              <div class="skeleton h-4 flex-1"></div>
              <div class="skeleton h-4 flex-1"></div>
              <div class="skeleton h-4 flex-1"></div>
              <div class="skeleton h-4 w-20"></div>
              <div class="skeleton h-4 w-24"></div>
            </div>
          }
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="px-4 py-3 text-left font-medium text-slate-600">Clave</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Valor</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Descripcion</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Tipo</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Actualizacion</th>
                <th class="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (c of configs(); track c.idConfiguracion) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 font-medium text-slate-700">{{ c.clave }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ c.valor }}</td>
                  <td class="px-4 py-3 text-slate-500 max-w-[250px] truncate">{{ c.descripcion || '-' }}</td>
                  <td class="px-4 py-3">
                    <span class="badge badge-info">{{ c.tipo || 'General' }}</span>
                  </td>
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ c.fechaActualizacion | date:'dd/MM/yy HH:mm' }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button class="btn-sm btn-secondary" (click)="openEditModal(c)">
                        <span class="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button class="btn-sm btn-danger" (click)="deleteConfig(c)">
                        <span class="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (configs().length === 0) {
                <tr><td colspan="6" class="px-4 py-16 text-center text-slate-400">No hay configuraciones</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <app-modal [open]="showFormModal()" [title]="editingConfig() ? 'Editar Configuracion' : 'Agregar Configuracion'" (closed)="showFormModal.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label">Clave *</label>
          <input class="input-field" [(ngModel)]="formData.clave" placeholder="Ej: app.version" />
        </div>
        <div>
          <label class="input-label">Valor *</label>
          <input class="input-field" [(ngModel)]="formData.valor" placeholder="Ej: 1.0.0" />
        </div>
        <div>
          <label class="input-label">Tipo</label>
          <select class="input-field" [(ngModel)]="formData.tipo">
            <option value="">General</option>
            <option value="Sistema">Sistema</option>
            <option value="Seguridad">Seguridad</option>
            <option value="Notificacion">Notificacion</option>
          </select>
        </div>
        <div>
          <label class="input-label">Descripcion</label>
          <textarea class="input-field" rows="2" [(ngModel)]="formData.descripcion" placeholder="Descripcion del parametro..."></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showFormModal.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="saveConfig()">{{ editingConfig() ? 'Actualizar' : 'Guardar' }}</button>
        </div>
      </div>
    </app-modal>
  `
})
export class SettingsComponent implements OnInit {
  readonly configs = signal<Configuracion[]>([]);
  readonly loading = signal(true);
  readonly showFormModal = signal(false);
  readonly editingConfig = signal<Configuracion | null>(null);

  formData: ConfiguracionFormData = { clave: '', valor: '' };

  constructor(
    private readonly configuracionService: ConfiguracionService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.loading.set(true);
    this.configuracionService.getAll().subscribe({
      next: (data) => {
        this.configs.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openAddModal(): void {
    this.formData = { clave: '', valor: '' };
    this.editingConfig.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(c: Configuracion): void {
    this.formData = { clave: c.clave, valor: c.valor, descripcion: c.descripcion, tipo: c.tipo };
    this.editingConfig.set(c);
    this.showFormModal.set(true);
  }

  saveConfig(): void {
    if (!this.formData.clave || !this.formData.valor) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }

    const request = this.editingConfig()
      ? this.configuracionService.update(this.editingConfig()!.idConfiguracion, this.formData)
      : this.configuracionService.create(this.formData);

    request.subscribe({
      next: () => {
        this.toast.success(this.editingConfig() ? 'Configuracion actualizada' : 'Configuracion creada');
        this.showFormModal.set(false);
        this.loadConfigs();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  deleteConfig(c: Configuracion): void {
    this.configuracionService.delete(c.idConfiguracion).subscribe({
      next: () => {
        this.toast.success('Configuracion eliminada');
        this.loadConfigs();
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
