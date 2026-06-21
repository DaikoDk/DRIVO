import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfiguracionService, ConfiguracionFormData } from '../../core/services/configuracion.service';
import { ToastService } from '../../core/services/toast.service';
import { Configuracion } from '../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Configuración</h1>
        <p class="text-sm text-slate-500 mt-1">Parámetros del sistema</p>
      </div>
      <button class="btn-primary flex items-center gap-2" (click)="openAddModal()">
        <span class="material-symbols-outlined text-lg">add</span>
        Agregar Configuración
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <app-stat-card label="Parámetros Totales" [value]="configs().length" icon="database" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
      <app-stat-card label="Por Tipo" [value]="statsTipos()" icon="category" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
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
                <th class="px-4 py-3 text-left font-medium text-slate-600">Descripción</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Tipo</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Actualización</th>
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
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ c.fechaActualizacion | date:'dd-MM-yyyy HH:mm' }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button class="btn-sm btn-secondary" title="Editar" aria-label="Editar configuración" (click)="openEditModal(c)">
                        <span class="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button class="btn-sm btn-danger" title="Eliminar" aria-label="Eliminar configuración" (click)="deleteConfig(c)">
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

    <app-modal [open]="showFormModal()" [title]="editingConfig() ? 'Editar Configuración' : 'Agregar Configuración'" (closed)="showFormModal.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label" for="cfg-clave">Clave *</label>
          <input class="input-field" id="cfg-clave" [(ngModel)]="formData.clave" placeholder="Ej: app.version" />
        </div>
        <div>
          <label class="input-label" for="cfg-valor">Valor *</label>
          <input class="input-field" id="cfg-valor" [(ngModel)]="formData.valor" placeholder="Ej: 1.0.0" />
        </div>
        <div>
          <label class="input-label" for="cfg-tipo">Tipo</label>
          <select class="input-field" id="cfg-tipo" [(ngModel)]="formData.tipo">
            <option value="">General</option>
            <option value="Sistema">Sistema</option>
            <option value="Seguridad">Seguridad</option>
            <option value="Notificación">Notificación</option>
          </select>
        </div>
        <div>
          <label class="input-label" for="cfg-descripcion">Descripción</label>
          <textarea class="input-field" id="cfg-descripcion" rows="2" [(ngModel)]="formData.descripcion" placeholder="Descripción del parámetro..."></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showFormModal.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="saveConfig()">{{ editingConfig() ? 'Actualizar' : 'Guardar' }}</button>
        </div>
      </div>
    </app-modal>

    <app-confirm-dialog
      [open]="showDeleteConfirm()"
      title="Eliminar Configuración"
      message="¿Está seguro de eliminar esta configuración?"
      confirmLabel="Eliminar"
      [danger]="true"
      (confirmed)="confirmDelete()"
      (cancelled)="showDeleteConfirm.set(false)">
    </app-confirm-dialog>
  `
})
export class SettingsComponent implements OnInit {
  readonly configs = signal<Configuracion[]>([]);
  readonly loading = signal(true);
  readonly showFormModal = signal(false);
  readonly editingConfig = signal<Configuracion | null>(null);
  readonly showDeleteConfirm = signal(false);
  readonly deleteTargetId = signal<number | null>(null);

  readonly statsTipos = computed(() => {
    const tipos = this.configs().map(c => c.tipo || 'General');
    const unique = new Set(tipos);
    return unique.size + ' tipos';
  });

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
        this.toast.error('Error al cargar configuraciones');
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
        this.toast.success(this.editingConfig() ? 'Configuración actualizada' : 'Configuración creada');
        this.showFormModal.set(false);
        this.loadConfigs();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  deleteConfig(c: Configuracion): void {
    this.deleteTargetId.set(c.idConfiguracion);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.configuracionService.delete(id).subscribe({
      next: () => {
        this.toast.success('Configuración eliminada');
        this.showDeleteConfirm.set(false);
        this.deleteTargetId.set(null);
        this.loadConfigs();
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
