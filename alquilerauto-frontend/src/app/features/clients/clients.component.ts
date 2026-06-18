import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ClienteService, ClienteFormData } from '../../core/services/cliente.service';
import { ToastService } from '../../core/services/toast.service';
import { Cliente } from '../../models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, StatusBadgeComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Clientes</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de clientes registrados</p>
      </div>
      <div class="flex gap-3">
        <input class="input-field w-64" type="search" placeholder="Buscar cliente..." [(ngModel)]="searchTerm" />
        <button class="btn-primary flex items-center gap-2" (click)="openAddModal()">
          <span class="material-symbols-outlined text-lg">person_add</span>
          Agregar Cliente
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Total Clientes" [value]="clientes().length" icon="group" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
      <app-stat-card label="Activos" [value]="clientes().filter(c => c.activo).length" icon="check_circle" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Bloqueados" [value]="clientes().filter(c => c.bloqueado).length" icon="block" iconBg="#fee2e2" iconColor="#dc2626"></app-stat-card>
      <app-stat-card label="Nuevos (mes)" [value]="statsMes().nuevosMes" icon="trending_up" iconBg="#ede9fe" iconColor="#7c3aed"></app-stat-card>
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
              <th class="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">DNI</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Email</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Teléfono</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Reservas</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
              <th class="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (c of filteredClientes(); track c.idCliente) {
              <tr class="hover:bg-slate-50 cursor-pointer" tabindex="0" [attr.aria-expanded]="expandedId() === c.idCliente" (click)="toggleExpand(c)" (keyup.enter)="toggleExpand(c)">
                <td class="px-4 py-3 font-medium text-slate-700">{{ c.nombre }} {{ c.apellidoPaterno }} {{ c.apellidoMaterno || '' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ c.dni }}</td>
                <td class="px-4 py-3 text-slate-700">{{ c.email }}</td>
                <td class="px-4 py-3 text-slate-700">{{ c.telefono || '-' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ c.numeroReservas }}</td>
                <td class="px-4 py-3">
                  <app-status-badge [status]="c.bloqueado ? 'bloqueado' : 'activo'" [label]="c.bloqueado ? 'Bloqueado' : 'Activo'"></app-status-badge>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="btn-sm btn-secondary" (click)="$event.stopPropagation(); openEditModal(c)" title="Editar" aria-label="Editar cliente">
                      <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    @if (c.bloqueado) {
                      <button class="btn-sm btn-primary" (click)="$event.stopPropagation(); desbloquear(c)" title="Desbloquear" aria-label="Desbloquear cliente">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                    } @else {
                      <button class="btn-sm btn-danger" (click)="$event.stopPropagation(); bloquear(c)" title="Bloquear" aria-label="Bloquear cliente">
                        <span class="material-symbols-outlined text-sm">block</span>
                      </button>
                    }
                  </div>
                </td>
              </tr>
              @if (expandedId() === c.idCliente) {
                <tr>
                  <td colspan="7" class="px-4 py-4 bg-slate-50">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="font-medium text-slate-600 mb-1">Licencia</p>
                        <p class="text-slate-700">{{ c.numeroLicencia || 'No registrada' }}</p>
                        <p class="text-slate-500 text-xs">Cat: {{ c.categoriaLicencia || '-' }} | Vence: {{ c.fechaVencimientoLicencia ? (c.fechaVencimientoLicencia | date:'dd/MM/yy') : '-' }}</p>
                      </div>
                      <div>
                        <p class="font-medium text-slate-600 mb-1">Dirección</p>
                        <p class="text-slate-700">{{ c.direccion || 'No registrada' }}</p>
                      </div>
                      <div>
                        <p class="font-medium text-slate-600 mb-1">Incidentes</p>
                        <p class="text-slate-700">{{ c.numeroIncidentes }}</p>
                        <p class="text-slate-500 text-xs">Registro: {{ c.fechaRegistro | date:'dd/MM/yy' }}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            }
            @if (filteredClientes().length === 0) {
              <tr><td colspan="7" class="px-4 py-16 text-center text-slate-400">No se encontraron clientes</td></tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>

    <app-modal [open]="showForm()" [title]="editingClient() ? 'Editar Cliente' : 'Agregar Cliente'" (closed)="closeForm()">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label" for="cli-nombre">Nombre *</label>
            <input class="input-field" id="cli-nombre" [(ngModel)]="formData.nombre" placeholder="Nombres" />
          </div>
          <div>
            <label class="input-label" for="cli-apellido-paterno">Apellido Paterno *</label>
            <input class="input-field" id="cli-apellido-paterno" [(ngModel)]="formData.apellidoPaterno" placeholder="Apellido paterno" />
          </div>
        </div>
        <div>
          <label class="input-label" for="cli-apellido-materno">Apellido Materno</label>
          <input class="input-field" id="cli-apellido-materno" [(ngModel)]="formData.apellidoMaterno" placeholder="Apellido materno" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label" for="cli-dni">DNI *</label>
            <input class="input-field" id="cli-dni" [(ngModel)]="formData.dni" placeholder="12345678" />
          </div>
          <div>
            <label class="input-label" for="cli-telefono">Teléfono</label>
            <input class="input-field" id="cli-telefono" [(ngModel)]="formData.telefono" placeholder="999888777" />
          </div>
        </div>
        <div>
          <label class="input-label" for="cli-email">Email *</label>
          <input class="input-field" id="cli-email" type="email" [(ngModel)]="formData.email" placeholder="cliente@email.com" />
        </div>
        <div>
          <label class="input-label" for="cli-direccion">Dirección</label>
          <input class="input-field" id="cli-direccion" [(ngModel)]="formData.direccion" placeholder="Av. Principal 123" />
        </div>
        <div class="border-t border-slate-100 pt-4 mt-2">
          <p class="text-sm font-semibold text-slate-700 mb-3">Licencia de Conducir</p>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="input-label" for="cli-licencia-numero">Numero</label>
              <input class="input-field" id="cli-licencia-numero" [(ngModel)]="formData.numeroLicencia" />
            </div>
            <div>
              <label class="input-label" for="cli-licencia-categoria">Categoría</label>
              <input class="input-field" id="cli-licencia-categoria" [(ngModel)]="formData.categoriaLicencia" />
            </div>
            <div>
              <label class="input-label" for="cli-licencia-vencimiento">Vencimiento</label>
              <input class="input-field" id="cli-licencia-vencimiento" type="date" [(ngModel)]="formData.fechaVencimientoLicencia" />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="closeForm()">Cancelar</button>
          <button class="btn-primary" (click)="saveClient()">{{ editingClient() ? 'Actualizar' : 'Guardar' }}</button>
        </div>
      </div>
    </app-modal>

    <app-confirm-dialog
      [open]="showBlockConfirm()"
      [title]="blockAction() === 'block' ? 'Bloquear Cliente' : 'Desbloquear Cliente'"
      [message]="blockAction() === 'block' ? '¿Está seguro de bloquear este cliente? No podrá realizar reservas.' : '¿Está seguro de desbloquear este cliente?'"
      [confirmLabel]="blockAction() === 'block' ? 'Bloquear' : 'Desbloquear'"
      [danger]="blockAction() === 'block'"
      (confirmed)="confirmBlock()"
      (cancelled)="closeBlockConfirm()">
    </app-confirm-dialog>
  `
})
export class ClientsComponent implements OnInit {
  readonly clientes = signal<Cliente[]>([]);
  readonly searchTerm = signal('');
  readonly expandedId = signal<number | null>(null);
  readonly showForm = signal(false);
  readonly editingClient = signal<Cliente | null>(null);
  readonly showBlockConfirm = signal(false);
  readonly blockAction = signal<'block' | 'unblock'>('block');
  readonly blockTargetId = signal<number | null>(null);

  readonly statsMes = computed(() => {
    const now = new Date();
    const mesActual = now.getMonth();
    const anioActual = now.getFullYear();
    const nuevosMes = this.clientes().filter(c => {
      if (!c.fechaRegistro) return false;
      const f = new Date(c.fechaRegistro);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    }).length;
    return { nuevosMes };
  });

  formData: ClienteFormData = this.emptyForm();

  constructor(
    private readonly clienteService: ClienteService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  readonly filteredClientes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.clientes();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.apellidoPaterno.toLowerCase().includes(term) ||
      c.dni.includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  readonly loading = signal(true);

  loadClientes(): void {
    this.loading.set(true);
    this.clienteService.getAll().subscribe({
      next: (data) => { this.clientes.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar clientes'); this.loading.set(false); }
    });
  }

  emptyForm(): ClienteFormData {
    return { nombre: '', apellidoPaterno: '', dni: '', email: '' };
  }

  openAddModal(): void {
    this.formData = this.emptyForm();
    this.editingClient.set(null);
    this.showForm.set(true);
  }

  openEditModal(client: Cliente): void {
    this.formData = {
      nombre: client.nombre,
      apellidoPaterno: client.apellidoPaterno,
      apellidoMaterno: client.apellidoMaterno,
      dni: client.dni,
      telefono: client.telefono,
      email: client.email,
      direccion: client.direccion,
      numeroLicencia: client.numeroLicencia,
      categoriaLicencia: client.categoriaLicencia,
      fechaVencimientoLicencia: client.fechaVencimientoLicencia,
    };
    this.editingClient.set(client);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingClient.set(null);
  }

  saveClient(): void {
    if (!this.formData.nombre || !this.formData.apellidoPaterno || !this.formData.dni || !this.formData.email) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.toast.warning('Ingrese un email válido');
      return;
    }
    if (!/^\d{8}$/.test(this.formData.dni)) {
      this.toast.warning('El DNI debe tener 8 dígitos');
      return;
    }
    if (this.formData.telefono && !/^\d{9}$/.test(this.formData.telefono)) {
      this.toast.warning('El teléfono debe tener 9 dígitos');
      return;
    }

    const request = this.editingClient()
      ? this.clienteService.update(this.editingClient()!.idCliente, this.formData)
      : this.clienteService.create(this.formData);

    request.subscribe({
      next: () => {
        this.toast.success(this.editingClient() ? 'Cliente actualizado' : 'Cliente creado');
        this.closeForm();
        this.loadClientes();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  toggleExpand(client: Cliente): void {
    this.expandedId.set(this.expandedId() === client.idCliente ? null : client.idCliente);
  }

  bloquear(client: Cliente): void {
    this.blockTargetId.set(client.idCliente);
    this.blockAction.set('block');
    this.showBlockConfirm.set(true);
  }

  desbloquear(client: Cliente): void {
    this.blockTargetId.set(client.idCliente);
    this.blockAction.set('unblock');
    this.showBlockConfirm.set(true);
  }

  confirmBlock(): void {
    const id = this.blockTargetId();
    if (!id) return;
    const request = this.blockAction() === 'block' ? this.clienteService.bloquear(id) : this.clienteService.desbloquear(id);
    request.subscribe({
      next: () => {
        this.toast.success(this.blockAction() === 'block' ? 'Cliente bloqueado' : 'Cliente desbloqueado');
        this.showBlockConfirm.set(false);
        this.loadClientes();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  closeBlockConfirm(): void {
    this.showBlockConfirm.set(false);
  }
}
