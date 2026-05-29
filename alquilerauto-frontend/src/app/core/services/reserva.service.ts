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
    return this.api.get<Reserva[]>('/reservas', { idCliente });
  }

  getByAuto(idAuto: number): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas', { idAuto });
  }

  create(data: ReservaFormData): Observable<Reserva> {
    return this.api.post<Reserva>('/reservas', data);
  }

  iniciar(id: number): Observable<Reserva> {
    return this.api.patch<Reserva>('/reservas', id, { accion: 'iniciar' });
  }

  finalizar(id: number, kilometrajeFin: number): Observable<Reserva> {
    return this.api.patch<Reserva>('/reservas', id, { accion: 'finalizar', kilometrajeFin });
  }

  cancelar(id: number): Observable<Reserva> {
    return this.api.patch<Reserva>('/reservas', id, { accion: 'cancelar' });
  }
}
