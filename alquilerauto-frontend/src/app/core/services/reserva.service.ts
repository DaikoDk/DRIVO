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

  iniciar(id: number, kilometrajeInicio: number): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/iniciar`, { kilometrajeInicio });
  }

  finalizar(id: number, kilometrajeFin: number, observaciones?: string): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/finalizar`, {
      kilometrajeFin,
      observaciones: observaciones || '',
      usuario: 'admin'
    });
  }

  cancelar(id: number): Observable<Reserva> {
    return this.api.patchCustom<Reserva>(`/reservas/${id}/cancelar`);
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
}
