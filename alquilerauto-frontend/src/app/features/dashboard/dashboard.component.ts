import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DashboardService, DashboardStats, ReservaHoy, VehiculoMantenimiento, IngresoMensual } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, StatusBadgeComponent, DatePipe],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-1">Resumen general del sistema</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Total Vehiculos" [value]="stats().totalVehiculos" icon="directions_car" iconBg="#dbeafe" iconColor="#2563eb" [change]="5"></app-stat-card>
      <app-stat-card label="Reservas Activas" [value]="stats().reservasActivas" icon="calendar_month" iconBg="#d1fae5" iconColor="#059669" [change]="12"></app-stat-card>
      <app-stat-card label="Ingresos del Mes" [value]="'$' + stats().ingresosMes.toLocaleString()" icon="payments" iconBg="#fef3c7" iconColor="#d97706" [change]="8"></app-stat-card>
      <app-stat-card label="Clientes Activos" [value]="stats().clientesActivos" icon="group" iconBg="#ede9fe" iconColor="#7c3aed" [change]="3"></app-stat-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card">
        <h3 class="text-base font-semibold text-slate-800 mb-4">Ingresos Mensuales</h3>
        <div class="h-48 flex items-end gap-2">
          @for (ingreso of ingresosMensuales(); track ingreso.mes) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <div [style.height.px]="(ingreso.monto / maxIngreso()) * 160" class="w-full rounded-t-md transition-all duration-500 bg-primary"></div>
              <span class="text-xs text-slate-500">{{ ingreso.mes }}</span>
            </div>
          }
        </div>
      </div>

      <div class="card">
        <h3 class="text-base font-semibold text-slate-800 mb-4">Vehiculos en Mantenimiento</h3>
        <div class="space-y-3">
          @for (v of vehiculosMantenimiento(); track v.placa) {
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-warning">engineering</span>
                <div>
                  <p class="text-sm font-medium text-slate-700">{{ v.placa }} - {{ v.modelo }}</p>
                  <p class="text-xs text-slate-500">{{ v.tipo }} | Ingreso: {{ v.fechaIngreso | date:'dd/MM/yy' }}</p>
                </div>
              </div>
              <span class="badge badge-warning">En curso</span>
            </div>
          }
          @if (vehiculosMantenimiento().length === 0) {
            <p class="text-sm text-slate-400 text-center py-4">No hay vehiculos en mantenimiento</p>
          }
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-base font-semibold text-slate-800 mb-4">Reservas de Hoy</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-4 py-3 text-left font-medium text-slate-600">ID</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Cliente</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Vehiculo</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Inicio</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Fin</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (r of reservasHoy(); track r.idReserva) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-700">#{{ r.idReserva }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.clienteNombre }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.placa }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.horaInicio }}</td>
                <td class="px-4 py-3 text-slate-700">{{ r.horaFin }}</td>
                <td class="px-4 py-3"><app-status-badge [status]="r.estado" [label]="r.estado"></app-status-badge></td>
              </tr>
            }
            @if (reservasHoy().length === 0) {
              <tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">No hay reservas para hoy</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  readonly stats = signal<DashboardStats>({ totalVehiculos: 0, reservasActivas: 0, ingresosMes: 0, clientesActivos: 0 });
  readonly reservasHoy = signal<ReservaHoy[]>([]);
  readonly vehiculosMantenimiento = signal<VehiculoMantenimiento[]>([]);
  readonly ingresosMensuales = signal<IngresoMensual[]>([]);

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => this.stats.set({ totalVehiculos: 45, reservasActivas: 12, ingresosMes: 15400, clientesActivos: 120 })
    });
    this.dashboardService.getReservasHoy().subscribe({
      next: (data) => this.reservasHoy.set(data),
      error: () => {}
    });
    this.dashboardService.getVehiculosMantenimiento().subscribe({
      next: (data) => this.vehiculosMantenimiento.set(data),
      error: () => {}
    });
    this.dashboardService.getIngresosMensuales().subscribe({
      next: (data) => this.ingresosMensuales.set(data),
      error: () => this.ingresosMensuales.set([
        { mes: 'Ene', monto: 8500 }, { mes: 'Feb', monto: 9200 }, { mes: 'Mar', monto: 11000 },
        { mes: 'Abr', monto: 10500 }, { mes: 'May', monto: 13500 }, { mes: 'Jun', monto: 15400 }
      ])
    });
  }

  maxIngreso(): number {
    const data = this.ingresosMensuales();
    return Math.max(...data.map(d => d.monto), 1);
  }
}
