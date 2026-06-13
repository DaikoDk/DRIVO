import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalAutos: number;
  reservasActivas: number;
  ingresosMes: number;
  clientesActivos: number;
}

export interface ReservaHoy {
  idReserva: number;
  cliente: string;
  placa: string;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  estado: string;
}

export interface VehiculoMantenimiento {
  placa: string;
  modelo: string;
  fechaIngreso: string;
  tipo: string;
}

export interface IngresoMensual {
  mes: string;
  monto: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats');
  }

  getReservasHoy(): Observable<ReservaHoy[]> {
    return this.api.get<ReservaHoy[]>('/dashboard/reservas-hoy');
  }

  getVehiculosMantenimiento(): Observable<VehiculoMantenimiento[]> {
    return this.api.get<VehiculoMantenimiento[]>('/dashboard/vehiculos-mantenimiento');
  }

  getIngresosMensuales(): Observable<IngresoMensual[]> {
    return this.api.get<IngresoMensual[]>('/dashboard/ingresos-mensuales');
  }
}
