import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReservaService } from '../../../core/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reserva } from '../../../models';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold text-slate-800 mb-2">Mis Reservas</h1>
      <p class="text-slate-500 mb-8">Historial de tus alquileres</p>

      <div class="card">
        @if (loading()) {
          <div class="space-y-4 p-4">
            @for (i of [1,2,3]; track i) {
              <div class="flex gap-4"><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 flex-1"></div><div class="skeleton h-4 w-20"></div></div>
            }
          </div>
        } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="px-4 py-3 text-left font-medium text-slate-600">ID</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Vehiculo</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Inicio</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Fin</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
                <th class="px-4 py-3 text-right font-medium text-slate-600">Accion</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (r of reservas(); track r.idReserva) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-slate-700">#{{ r.idReserva }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ r.marca }} {{ r.modelo }} ({{ r.placa }})</td>
                  <td class="px-4 py-3 text-slate-700">{{ r.fechaInicio | date:'dd/MM/yy' }} {{ r.horaInicio }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ r.fechaFin | date:'dd/MM/yy' }} {{ r.horaFin }}</td>
                  <td class="px-4 py-3 font-medium text-slate-700">S/{{ r.total.toFixed(2) }}</td>
                  <td class="px-4 py-3">
                    <span class="badge" [class.badge-warning]="r.estado === 'Pendiente'" [class.badge-info]="r.estado === 'En proceso'" [class.badge-success]="r.estado === 'Confirmada' || r.estado === 'Finalizada'" [class.badge-error]="r.estado === 'Cancelada'" [class.badge-neutral]="r.estado === 'Finalizada'">{{ r.estado }}</span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    @if (r.estado === 'Pendiente') {
                      <button class="btn-sm btn-danger" (click)="cancelar(r)">Cancelar</button>
                    }
                  </td>
                </tr>
              }
              @if (reservas().length === 0) {
                <tr>
                  <td colspan="7" class="px-4 py-16 text-center">
                    <span class="material-symbols-outlined text-5xl text-slate-300 mb-3 block">calendar_month</span>
                    <p class="text-slate-500 mb-2">No tienes reservas aun</p>
                    <a routerLink="/portal/catalogo" class="text-primary font-medium text-sm hover:underline">Explorar catalogo</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        }
      </div>
    </div>
  `
})
export class MisReservasComponent implements OnInit {
  readonly reservas = signal<Reserva[]>([]);
  readonly loading = signal(true);

  constructor(
    private readonly reservaService: ReservaService,
    private readonly toast: ToastService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.reservaService.getMisReservas().subscribe({
      next: (d) => { this.reservas.set(d); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar tus reservas'); this.loading.set(false); }
    });
  }

  cancelar(r: Reserva): void {
    this.reservaService.cancelarDesdePortal(r.idReserva).subscribe({
      next: () => {
        this.toast.success('Reserva cancelada');
        this.reservaService.getMisReservas().subscribe({ next: (d) => this.reservas.set(d) });
      },
      error: (err) => this.toast.error(err.message)
    });
  }
}
