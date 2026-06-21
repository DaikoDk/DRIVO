import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Reserva } from '../../models';

export interface ReservaFormData {
  idCliente: number;
  idAuto: number;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
}

export interface ReservaPortalFormData {
  idAuto: number;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas');
  }

  getById(id: number): Observable<Reserva> {
    return this.api.getById<Reserva>('/reservas', id);
  }

  getByEstado(estado: string): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas', { estado });
  }

  getByCliente(idCliente: number): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas', { idCliente: String(idCliente) });
  }

  getByAuto(idAuto: number): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas', { idAuto: String(idAuto) });
  }

  create(data: ReservaFormData): Observable<Reserva> {
    return this.api.post<Reserva>('/reservas', data);
  }

  finalizar(id: number, kilometrajeFin: number, estadoEntrega: string, reparaciones?: { descripcion: string; costo: number; idCatalogoReparacion?: number; responsable?: string }[]): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/finalizar`, {
      kilometrajeFin,
      estadoEntrega,
      reparaciones: reparaciones || []
    });
  }

  entregar(id: number, kilometrajeFin: number, estadoEntrega: string, reparaciones?: { descripcion: string; costo: number; idCatalogoReparacion?: number; responsable?: string }[]): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/entregar`, {
      kilometrajeFin,
      estadoEntrega,
      reparaciones: reparaciones || []
    });
  }

  cancelar(id: number): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/cancelar`);
  }

  finalizarPago(id: number): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/finalizar-pago`);
  }

  createDesdePortal(data: ReservaPortalFormData): Observable<Reserva> {
    return this.api.post<Reserva>('/reservas/desde-portal', data);
  }

  getMisReservas(): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas/mis-reservas');
  }

  cancelarDesdePortal(id: number): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/cancelar-desde-portal`);
  }

  bufferCheck(idAuto: number, fechaInicio: string, horaInicio: string): Observable<{ riesgo: boolean; mensaje: string | null; horasMargen: number; fechaFinAnterior: string | null; horaFinAnterior: string | null }> {
    return this.api.get<{ riesgo: boolean; mensaje: string | null; horasMargen: number; fechaFinAnterior: string | null; horaFinAnterior: string | null }>(
      '/reservas/buffer-check', { idAuto, fechaInicio, horaInicio });
  }
}
