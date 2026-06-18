import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { AutoService, AutoFormData } from '../../core/services/auto.service';
import { MarcaService } from '../../core/services/marca.service';
import { ModeloService } from '../../core/services/modelo.service';
import { ToastService } from '../../core/services/toast.service';
import { Auto, Marca, Modelo } from '../../models';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent, ModalComponent, ConfirmDialogComponent, PaginationComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Vehículos</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de flota vehicular</p>
      </div>
      <div class="flex gap-3">
        <input class="input-field w-64" type="search" placeholder="Buscar vehículo..." [(ngModel)]="searchTerm" />
        <button class="btn-primary flex items-center gap-2" (click)="openAddModal()">
          <span class="material-symbols-outlined text-lg">add</span>
          Agregar Vehículo
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      @if (loading()) {
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="card animate-pulse">
            <div class="w-full h-32 rounded-lg mb-4 bg-slate-200"></div>
            <div class="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
            <div class="h-3 bg-slate-200 rounded mb-4 w-1/2"></div>
            <div class="flex justify-between pt-3 border-t border-slate-100">
              <div class="h-4 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        }
      }
      @if (error()) {
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-red-300 mb-4">error</span>
          <p class="text-sm text-red-500 mb-2">{{ error() }}</p>
          <button class="btn-secondary" (click)="loadAutos()">Reintentar</button>
        </div>
      }
      @for (auto of pagedAutos(); track auto.idAuto) {
        <div class="card">
          <div class="w-full h-32 rounded-lg mb-4 flex items-center justify-center" [style.background]="'linear-gradient(135deg, ' + getGradient(auto) + ')'">
            <span class="material-symbols-outlined text-5xl text-white/80">directions_car</span>
          </div>
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="text-base font-semibold text-slate-800">{{ auto.placa }}</h3>
              <p class="text-sm text-slate-500">{{ auto.marca || '' }} {{ auto.modelo || '' }}</p>
            </div>
            <app-status-badge [status]="auto.estado" [label]="auto.estado"></app-status-badge>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_today</span>{{ auto.anio }}</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">speed</span>{{ auto.kilometrajeActual.toLocaleString() }} km</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <p class="text-lg font-bold text-slate-800">S/{{ auto.precioPorDia.toFixed(2) }}<span class="text-xs font-normal text-slate-500"> /día</span></p>
            <div class="flex items-center gap-2">
              <button class="btn-sm btn-secondary" (click)="openEditModal(auto)" title="Editar" aria-label="Editar vehículo">
                <span class="material-symbols-outlined text-sm">edit</span>
              </button>
              <button class="btn-sm btn-danger" (click)="prepareDelete(auto)" title="Eliminar" aria-label="Eliminar vehículo">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      }
      @if (!loading() && pagedAutos().length === 0) {
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">directions_car</span>
          <p class="text-sm text-slate-400">No se encontraron vehículos</p>
        </div>
      }
    </div>

    <app-pagination [currentPage]="currentPage()" [totalPages]="totalPagesComputed()" [totalItems]="filteredAutos().length" [pageSize]="pageSize" (pageChange)="currentPage.set($event)"></app-pagination>

    <app-modal [open]="showForm()" [title]="editingAuto() ? 'Editar Vehículo' : 'Agregar Vehículo'" (closed)="closeForm()">
      <div class="space-y-4">
        <div>
          <label class="input-label" for="veh-placa">Placa *</label>
          <input class="input-field" id="veh-placa" [(ngModel)]="formData.placa" placeholder="ABC-123" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label" for="veh-marca">Marca *</label>
            <select class="input-field" id="veh-marca" [(ngModel)]="formData.idMarca" (change)="onMarcaChange()">
              <option [ngValue]="0" disabled>{{ loadingMarcas() ? 'Cargando...' : 'Seleccionar...' }}</option>
              @for (m of marcas(); track m.idMarca) {
                <option [ngValue]="m.idMarca">{{ m.nombre }}</option>
              }
            </select>
          </div>
          <div>
            <label class="input-label" for="veh-modelo">Modelo *</label>
            <select class="input-field" id="veh-modelo" [(ngModel)]="formData.idModelo">
              <option [ngValue]="0" disabled>Seleccionar...</option>
              @for (m of modelos(); track m.idModelo) {
                <option [ngValue]="m.idModelo">{{ m.nombre }}</option>
              }
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label" for="veh-anio">Año *</label>
            <input class="input-field" id="veh-anio" type="number" [(ngModel)]="formData.anio" />
          </div>
          <div>
            <label class="input-label" for="veh-color">Color</label>
            <input class="input-field" id="veh-color" [(ngModel)]="formData.color" />
          </div>
        </div>
        <div>
          <label class="input-label" for="veh-numero-motor">Numero de Motor</label>
          <input class="input-field" id="veh-numero-motor" [(ngModel)]="formData.numeroMotor" />
        </div>
        <div>
          <label class="input-label" for="veh-numero-chasis">Numero de Chasis</label>
          <input class="input-field" id="veh-numero-chasis" [(ngModel)]="formData.numeroChasis" />
        </div>
        <div>
          <label class="input-label" for="veh-kilometraje">Kilometraje Actual *</label>
          <input class="input-field" id="veh-kilometraje" type="number" [(ngModel)]="formData.kilometrajeActual" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="input-label" for="veh-precio-dia">Precio/Día *</label>
            <input class="input-field" id="veh-precio-dia" type="number" step="0.01" [(ngModel)]="formData.precioPorDia" />
          </div>
          <div>
            <label class="input-label" for="veh-precio-hora">Precio/Hora</label>
            <input class="input-field" id="veh-precio-hora" type="number" step="0.01" [(ngModel)]="formData.precioPorHora" />
          </div>
          <div>
            <label class="input-label" for="veh-mora-dia">Mora/Día *</label>
            <input class="input-field" id="veh-mora-dia" type="number" step="0.01" [(ngModel)]="formData.moraPorDia" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="closeForm()">Cancelar</button>
          <button class="btn-primary" (click)="saveAuto()">{{ editingAuto() ? 'Actualizar' : 'Guardar' }}</button>
        </div>
      </div>
    </app-modal>

    <app-confirm-dialog
      [open]="showDeleteConfirm()"
      title="Eliminar Vehículo"
      message="¿Está seguro de eliminar este vehículo?"
      confirmLabel="Eliminar"
      [danger]="true"
      (confirmed)="deleteAuto()"
      (cancelled)="showDeleteConfirm.set(false)">
    </app-confirm-dialog>
  `
})
export class VehiclesComponent implements OnInit {
  readonly autos = signal<Auto[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly modelos = signal<Modelo[]>([]);
  readonly loading = signal(true);
  readonly loadingMarcas = signal(true);
  readonly error = signal('');
  readonly currentPage = signal(1);
  readonly searchTerm = signal('');
  readonly showForm = signal(false);
  readonly editingAuto = signal<Auto | null>(null);
  readonly showDeleteConfirm = signal(false);
  readonly deletingId = signal<number | null>(null);

  formData: AutoFormData = this.emptyForm();

  constructor(
    private readonly autoService: AutoService,
    private readonly marcaService: MarcaService,
    private readonly modeloService: ModeloService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAutos();
    this.marcaService.getActivos().subscribe({
      next: (d) => { this.marcas.set(d); this.loadingMarcas.set(false); },
      error: (err) => { this.toast.error('Error al cargar marcas: ' + err.message); this.loadingMarcas.set(false); }
    });
  }

  loadAutos(): void {
    this.loading.set(true);
    this.error.set('');
    this.autoService.getAll().subscribe({
      next: (data) => { this.autos.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  readonly filteredAutos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.autos();
    return this.autos().filter(a =>
      a.placa.toLowerCase().includes(term) ||
      (a.marca || '').toLowerCase().includes(term) ||
      (a.modelo || '').toLowerCase().includes(term)
    );
  });

  readonly pageSize = 6;

  readonly totalPagesComputed = computed(() =>
    Math.max(1, Math.ceil(this.filteredAutos().length / this.pageSize))
  );

  readonly pagedAutos = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAutos().slice(start, start + this.pageSize);
  });

  emptyForm(): AutoFormData {
    return { placa: '', idMarca: 0, idModelo: 0, anio: new Date().getFullYear(), kilometrajeActual: 0, precioPorDia: 0, moraPorDia: 0 };
  }

  openAddModal(): void {
    this.formData = this.emptyForm();
    this.editingAuto.set(null);
    this.showForm.set(true);
  }

  openEditModal(auto: Auto): void {
    const marcaId = this.marcas().find(m => m.nombre === auto.marca)?.idMarca || 0;
    const modeloId = this.modelos().find(m => m.nombre === auto.modelo)?.idModelo || 0;
    this.formData = {
      placa: auto.placa,
      idMarca: marcaId,
      idModelo: modeloId,
      anio: auto.anio,
      color: auto.color,
      numeroMotor: auto.numeroMotor,
      numeroChasis: auto.numeroChasis,
      kilometrajeActual: auto.kilometrajeActual,
      precioPorDia: auto.precioPorDia,
      precioPorHora: auto.precioPorHora,
      moraPorDia: auto.moraPorDia,
    };
    this.editingAuto.set(auto);
    if (marcaId) { this.onMarcaChange(); }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingAuto.set(null);
  }

  onMarcaChange(): void {
    if (this.formData.idMarca) {
      this.modelos.set([]);
      this.modeloService.getByMarca(this.formData.idMarca).subscribe({
        next: (d) => this.modelos.set(d),
        error: (err) => this.toast.error('Error al cargar modelos: ' + err.message)
      });
    }
  }

  saveAuto(): void {
    if (!this.formData.placa || !this.formData.idMarca || !this.formData.idModelo) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }

    const request = this.editingAuto()
      ? this.autoService.update(this.editingAuto()!.idAuto, this.formData)
      : this.autoService.create(this.formData);

    request.subscribe({
      next: () => {
        this.toast.success(this.editingAuto() ? 'Vehiculo actualizado' : 'Vehiculo creado');
        this.closeForm();
        this.loadAutos();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  prepareDelete(auto: Auto): void {
    this.deletingId.set(auto.idAuto);
    this.showDeleteConfirm.set(true);
  }

  deleteAuto(): void {
    const id = this.deletingId();
    if (!id) return;
    this.autoService.delete(id).subscribe({
      next: () => {
        this.toast.success('Vehiculo eliminado');
        this.showDeleteConfirm.set(false);
        this.loadAutos();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  getGradient(auto: Auto): string {
    const colors: Record<string, string> = {
      'Disponible': '#10b981, #059669',
      'En reserva': '#3b82f6, #2563eb',
      'En reparacion': '#f59e0b, #d97706',
      'Mantenimiento': '#8b5cf6, #7c3aed',
    };
    return colors[auto.estado] || '#64748b, #475569';
  }
}
