import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PagoService, PagoFormData } from '../../core/services/pago.service';
import { ReservaService } from '../../core/services/reserva.service';
import { ToastService } from '../../core/services/toast.service';
import { Pago, Reserva } from '../../models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [FormsModule, DatePipe, StatCardComponent, ModalComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Pagos</h1>
        <p class="text-sm text-slate-500 mt-1">Registro y consulta de pagos</p>
      </div>
      <div class="flex gap-3">
        <input class="input-field w-48" type="date" [(ngModel)]="filterDate" />
        <button class="btn-primary flex items-center gap-2" (click)="openRegisterModal()">
          <span class="material-symbols-outlined text-lg">receipt_long</span>
          Registrar Pago
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Cobranza del Mes" [value]="'S/ ' + statsMes().cobranza" icon="payments" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Pendientes" [value]="statsMes().pendientes" icon="pending_actions" iconBg="#fef3c7" iconColor="#d97706"></app-stat-card>
      <app-stat-card label="Metodo mas usado" [value]="statsMes().metodoTop" icon="credit_card" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
      <app-stat-card label="Morosidad" [value]="statsMes().morosidad" icon="warning" iconBg="#fee2e2" iconColor="#dc2626"></app-stat-card>
    </div>

    <div class="card">
      @if (loading()) {
        <div class="space-y-4 p-4">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex gap-4"><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 w-20"></div></div>
          }
        </div>
      } @else if (filteredPagos().length > 0) {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="px-4 py-3 text-left font-medium text-slate-600">ID</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Reserva</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Cliente</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Monto Base</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Mora</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Danos</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Metodo</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (p of filteredPagos(); track p.idPago) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-slate-700">#{{ p.idPago }}</td>
                  <td class="px-4 py-3 text-slate-700">#{{ p.idReserva }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ p.nombreCliente }}</td>
                  <td class="px-4 py-3 text-slate-700">S/{{ p.montoBase.toFixed(2) }}</td>
                  <td class="px-4 py-3 text-slate-700">S/{{ p.montoMora.toFixed(2) }}</td>
                  <td class="px-4 py-3 text-slate-700">S/{{ p.montoDanos.toFixed(2) }}</td>
                  <td class="px-4 py-3 font-medium text-slate-700">S/{{ p.montoTotalPagado.toFixed(2) }}</td>
                  <td class="px-4 py-3">
                    <span class="badge" [class.badge-info]="p.metodoPago === 'Tarjeta'" [class.badge-success]="p.metodoPago === 'Efectivo'" [class.badge-neutral]="p.metodoPago === 'Transferencia'">{{ p.metodoPago }}</span>
                  </td>
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ p.fechaPago | date:'dd/MM/yy HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">receipt_long</span>
          <h3 class="text-lg font-medium text-slate-600 mb-1">No hay pagos registrados</h3>
          <p class="text-sm text-slate-400">Los pagos apareceran aqui cuando se registren</p>
        </div>
      }
    </div>

    <app-modal [open]="showRegisterModal()" title="Registrar Pago" (closed)="showRegisterModal.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label" for="pay-reserva">Reserva *</label>
          <select class="input-field" id="pay-reserva" [(ngModel)]="formData.idReserva">
            <option [ngValue]="0" disabled>Seleccionar...</option>
            @for (r of reservas(); track r.idReserva) {
              <option [ngValue]="r.idReserva">#{{ r.idReserva }} - {{ r.nombreCliente }}</option>
            }
          </select>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="input-label" for="pay-monto-base">Monto Base *</label>
            <input class="input-field" id="pay-monto-base" type="number" step="0.01" [(ngModel)]="formData.montoBase" />
          </div>
          <div>
            <label class="input-label" for="pay-mora">Mora</label>
            <input class="input-field" id="pay-mora" type="number" step="0.01" [(ngModel)]="formData.montoMora" />
          </div>
          <div>
            <label class="input-label" for="pay-danos">Danos</label>
            <input class="input-field" id="pay-danos" type="number" step="0.01" [(ngModel)]="formData.montoDanos" />
          </div>
        </div>
        <div>
          <label class="input-label">Total: <span class="font-bold text-primary">S/{{ (formData.montoBase + formData.montoMora + formData.montoDanos).toFixed(2) }}</span></label>
        </div>
        <div>
          <label class="input-label" for="pay-metodo">Metodo de Pago *</label>
          <select class="input-field" id="pay-metodo" [(ngModel)]="formData.metodoPago">
            <option value="" disabled>Seleccionar...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showRegisterModal.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="registerPago()" [disabled]="!formData.idReserva || !formData.metodoPago">Registrar</button>
        </div>
      </div>
    </app-modal>
  `
})
export class PaymentsComponent implements OnInit {
  readonly pagos = signal<Pago[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly showRegisterModal = signal(false);
  readonly filterDate = signal('');

  formData: PagoFormData = { idReserva: 0, montoBase: 0, montoMora: 0, montoDanos: 0, metodoPago: '' };

  readonly statsMes = computed(() => {
    const now = new Date();
    const mesActual = now.getMonth();
    const anioActual = now.getFullYear();
    const pagosMes = this.pagos().filter(p => {
      const f = new Date(p.fechaPago);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    });
    const cobranza = pagosMes.reduce((s, p) => s + p.montoTotalPagado, 0);
    const totalMora = pagosMes.reduce((s, p) => s + p.montoMora, 0);
    const totalPagado = pagosMes.reduce((s, p) => s + p.montoTotalPagado, 0);
    const morosidadPct = totalPagado > 0 ? ((totalMora / totalPagado) * 100).toFixed(1) + '%' : '0%';
    const metodos: Record<string, number> = {};
    pagosMes.forEach(p => { metodos[p.metodoPago] = (metodos[p.metodoPago] || 0) + 1; });
    const metodoTop = Object.entries(metodos).sort((a, b) => b[1] - a[1])[0]?.[0] || '--';
    const reservasConPago = new Set(this.pagos().map(p => p.idReserva));
    const pendientes = this.reservas().filter(r =>
      r.estado !== 'Cancelada' && r.estado !== 'Finalizada' && !reservasConPago.has(r.idReserva)
    ).length;
    return {
      cobranza: cobranza.toFixed(2),
      pendientes,
      metodoTop,
      morosidad: morosidadPct,
    };
  });

  constructor(
    private readonly pagoService: PagoService,
    private readonly reservaService: ReservaService,
    private readonly toast: ToastService
  ) {}

  readonly loading = signal(true);

  readonly filteredPagos = computed(() => {
    const fd = this.filterDate();
    if (!fd) return this.pagos();
    return this.pagos().filter(p => p.fechaPago && p.fechaPago.startsWith(fd));
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.pagoService.getAll().subscribe({
      next: (data) => { this.pagos.set(data); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar pagos'); this.loading.set(false); }
    });
    this.reservaService.getAll().subscribe({
      next: (data) => this.reservas.set(data),
      error: () => this.toast.error('Error al cargar reservas')
    });
  }

  openRegisterModal(): void {
    this.formData = { idReserva: 0, montoBase: 0, montoMora: 0, montoDanos: 0, metodoPago: '' };
    this.showRegisterModal.set(true);
  }

  registerPago(): void {
    if (!this.formData.idReserva || !this.formData.metodoPago) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }
    this.pagoService.register(this.formData).subscribe({
      next: () => {
        this.toast.success('Pago registrado exitosamente');
        this.showRegisterModal.set(false);
        this.pagoService.getAll().subscribe({ next: (data) => this.pagos.set(data) });
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  get total(): number {
    return this.formData.montoBase + this.formData.montoMora + this.formData.montoDanos;
  }
}
