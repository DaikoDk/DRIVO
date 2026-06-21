import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PagoService, PagoFormData } from '../../core/services/pago.service';
import { ReservaService } from '../../core/services/reserva.service';
import { ToastService } from '../../core/services/toast.service';
import { Pago, Reserva } from '../../models';

interface BoletaData {
  idPago: number;
  fecha: string;
  clienteNombre: string;
  clienteDni: string;
  vehiculo: string;
  periodoInicio: string;
  periodoFin: string;
  dias: number;
  precioPorDia: number;
  subtotal: number;
  mora: number;
  costoReparaciones: number;
  total: number;
  igv: number;
  metodoPago: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, StatCardComponent, ModalComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Pagos</h1>
        <p class="text-sm text-slate-500 mt-1">Registro y consulta de pagos</p>
      </div>
      <div class="flex gap-3">
        <input class="input-field w-48" type="date" [(ngModel)]="filterDate" />
        <button class="btn-primary flex items-center gap-2" (click)="openRegisterModal()">
          <span class="material-symbols-outlined text-lg">payments</span>
          Procesar Pago
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Cobranza del Mes" [value]="'S/ ' + statsMes().cobranza" icon="payments" iconBg="#d1fae5" iconColor="#059669"></app-stat-card>
      <app-stat-card label="Pendientes" [value]="statsMes().pendientes" icon="pending_actions" iconBg="#fef3c7" iconColor="#d97706"></app-stat-card>
      <app-stat-card label="Método más usado" [value]="statsMes().metodoTop" icon="credit_card" iconBg="#dbeafe" iconColor="#2563eb"></app-stat-card>
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
                <th class="px-4 py-3 text-left font-medium text-slate-600">Daños</th>
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
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ p.fechaPago | date:'dd-MM-yyyy HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">receipt_long</span>
          <h3 class="text-lg font-medium text-slate-600 mb-1">No hay pagos registrados</h3>
          <p class="text-sm text-slate-400">Los pagos aparecerán aquí cuando se registren</p>
        </div>
      }
    </div>

    <app-modal [open]="showRegisterModal()" title="Procesar Pago" (closed)="showRegisterModal.set(false)">
      <div class="space-y-4">
        <div>
          <label class="input-label" for="pay-reserva">Reserva *</label>
          <select class="input-field" id="pay-reserva" [(ngModel)]="formData.idReserva" (ngModelChange)="onReservaSelected()">
            <option [ngValue]="0" disabled>Seleccionar...</option>
            @for (r of reservasEntregadas(); track r.idReserva) {
              <option [ngValue]="r.idReserva">#{{ r.idReserva }} - {{ r.nombreCliente }} ({{ r.placa }})</option>
            }
          </select>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="input-label">Monto Base</label>
            <p class="input-field bg-slate-50 text-slate-700 py-2 px-3 rounded-lg">S/{{ formData.montoBase.toFixed(2) }}</p>
          </div>
          <div>
            <label class="input-label">Mora</label>
            <p class="input-field bg-slate-50 text-slate-700 py-2 px-3 rounded-lg">S/{{ formData.montoMora.toFixed(2) }}</p>
          </div>
          <div>
            <label class="input-label">Daños</label>
            <p class="input-field bg-slate-50 text-slate-700 py-2 px-3 rounded-lg">S/{{ formData.montoDanos.toFixed(2) }}</p>
          </div>
        </div>
        <div>
          <label class="input-label">Total: <span class="font-bold text-primary">S/{{ (formData.montoBase + formData.montoMora + formData.montoDanos).toFixed(2) }}</span></label>
        </div>
        <div>
          <label class="input-label" for="pay-metodo">Método de Pago *</label>
          <select class="input-field" id="pay-metodo" [(ngModel)]="formData.metodoPago">
            <option value="" disabled>Seleccionar...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showRegisterModal.set(false)">Cancelar</button>
          <button class="btn-primary" (click)="registerPago()" [disabled]="!formData.idReserva || !formData.metodoPago">Procesar Pago</button>
        </div>
      </div>
    </app-modal>

    <app-modal [open]="showBoleta()" title="Boleta de Pago - B001-{{ boletaData().idPago }}" (closed)="showBoleta.set(false)">
      <div class="boleta-wrapper">
        <div class="boleta" id="boleta-content">
          <div class="text-center border-b pb-4 mb-4">
            <h2 class="text-xl font-bold text-slate-800">DRIVO Rent-a-Car</h2>
            <p class="text-sm text-slate-500">RUC: 20601234567</p>
            <p class="text-sm text-slate-500">Av. La Marina 1234, San Miguel</p>
            <p class="text-sm text-slate-500">Lima - Perú</p>
          </div>
          <div class="flex justify-between text-sm text-slate-600 mb-4">
            <span><strong>Boleta:</strong> B001-{{ boletaData().idPago }}</span>
            <span><strong>Fecha:</strong> {{ boletaData().fecha }}</span>
          </div>
          <div class="border-t pt-3 mb-4 text-sm space-y-1">
            <p><strong>Cliente:</strong> {{ boletaData().clienteNombre }}</p>
            <p><strong>DNI:</strong> {{ boletaData().clienteDni }}</p>
            <p><strong>Vehículo:</strong> {{ boletaData().vehiculo }}</p>
          </div>
          <table class="w-full text-sm mb-4">
            <thead>
              <tr class="border-b border-slate-300">
                <th class="text-left py-2 text-slate-600">Descripción</th>
                <th class="text-right py-2 text-slate-600">Importe</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr>
                <td class="py-2 text-slate-700">Alquiler x {{ boletaData().dias }} día(s) (S/{{ boletaData().precioPorDia | number:'1.2-2' }}/día)</td>
                <td class="py-2 text-right text-slate-700">S/{{ boletaData().subtotal | number:'1.2-2' }}</td>
              </tr>
              <tr>
                <td class="py-2 text-slate-700">Mora por devolución tardía</td>
                <td class="py-2 text-right" [class.text-red-600]="boletaData().mora > 0">S/{{ boletaData().mora | number:'1.2-2' }}</td>
              </tr>
              <tr>
                <td class="py-2 text-slate-700">Reparaciones / daños</td>
                <td class="py-2 text-right" [class.text-red-600]="boletaData().costoReparaciones > 0">S/{{ boletaData().costoReparaciones | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
          <div class="border-t pt-3 space-y-1 text-sm">
            <div class="flex justify-between text-slate-600"><span>Subtotal (incl. IGV)</span><span>S/{{ boletaData().total | number:'1.2-2' }}</span></div>
            <div class="flex justify-between text-slate-600"><span>IGV (18%)</span><span>S/{{ boletaData().igv | number:'1.2-2' }}</span></div>
            <div class="flex justify-between text-base font-bold text-slate-800 border-t pt-2"><span>Total</span><span>S/{{ boletaData().total | number:'1.2-2' }}</span></div>
          </div>
          <div class="border-t mt-4 pt-3 text-sm text-slate-500">
            <p><strong>Método de pago:</strong> {{ boletaData().metodoPago }}</p>
            <p class="text-xs mt-2 text-center">Gracias por su preferencia</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="btn-secondary" (click)="showBoleta.set(false)">Cerrar</button>
          <button class="btn-primary flex items-center gap-2" (click)="printBoleta()">
            <span class="material-symbols-outlined text-lg">print</span>
            Imprimir
          </button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .boleta-wrapper { max-width: 400px; margin: 0 auto; }
    .boleta { background: white; padding: 1.5rem; }
    @media print {
      body * { visibility: hidden; }
      #boleta-content, #boleta-content * { visibility: visible; }
      #boleta-content { position: absolute; left: 0; top: 0; width: 100%; }
      .boleta-wrapper > .flex { display: none; }
    }
  `]
})
export class PaymentsComponent implements OnInit {
  readonly pagos = signal<Pago[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly showRegisterModal = signal(false);
  readonly showBoleta = signal(false);
  readonly boletaData = signal<BoletaData>({
    idPago: 0, fecha: '', clienteNombre: '', clienteDni: '',
    vehiculo: '', periodoInicio: '', periodoFin: '', dias: 0,
    precioPorDia: 0, subtotal: 0, mora: 0, costoReparaciones: 0,
    total: 0, igv: 0, metodoPago: ''
  });
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
      r.estado !== 'RESERVA_CANCELADA' && r.estado !== 'ALQUILER_FINALIZADO' && r.estado !== 'RESERVA_EXPIRADA' && !reservasConPago.has(r.idReserva)
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

  readonly reservasEntregadas = computed(() =>
    this.reservas().filter(r => r.estado === 'ALQUILER_ENTREGADO')
  );

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

  onReservaSelected(): void {
    const r = this.reservas().find(x => x.idReserva === this.formData.idReserva);
    if (r) {
      this.formData.montoBase = r.subtotal;
      this.formData.montoMora = r.mora;
      this.formData.montoDanos = r.costoReparaciones;
    }
  }

  registerPago(): void {
    if (!this.formData.idReserva || !this.formData.metodoPago) {
      this.toast.warning('Complete los campos obligatorios');
      return;
    }
    const reserva = this.reservas().find(r => r.idReserva === this.formData.idReserva);
    if (!reserva) { this.toast.error('Reserva no encontrada'); return; }

    this.pagoService.register(this.formData).pipe(
      switchMap(pago => this.reservaService.finalizarPago(reserva.idReserva).pipe(
        switchMap(() => {
          const igv = reserva.total / 1.18 * 0.18;
          this.boletaData.set({
            idPago: pago.idPago,
            fecha: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            clienteNombre: reserva.nombreCliente,
            clienteDni: reserva.dniCliente ?? '',
            vehiculo: `${reserva.placa} - ${reserva.marca} ${reserva.modelo}`,
            periodoInicio: reserva.fechaInicio,
            periodoFin: reserva.fechaFin,
            dias: this.calcularDias(reserva.fechaInicio, reserva.fechaFin),
            precioPorDia: reserva.subtotal / this.calcularDias(reserva.fechaInicio, reserva.fechaFin),
            subtotal: reserva.subtotal,
            mora: reserva.mora,
            costoReparaciones: reserva.costoReparaciones,
            total: reserva.total,
            igv,
            metodoPago: this.formData.metodoPago
          });
          this.showRegisterModal.set(false);
          this.showBoleta.set(true);
          return this.pagoService.getAll();
        })
      ))
    ).subscribe({
      next: (data) => {
        this.toast.success('Pago procesado exitosamente');
        this.pagos.set(data);
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  private calcularDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }

  get total(): number {
    return this.formData.montoBase + this.formData.montoMora + this.formData.montoDanos;
  }

  printBoleta(): void {
    window.print();
  }
}
