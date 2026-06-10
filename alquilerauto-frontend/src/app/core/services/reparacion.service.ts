import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Reparacion, CatalogoReparacion } from '../../models';

export interface ReparacionFormData {
  idReserva: number;
  idAuto: number;
  idCatalogoReparacion?: number;
  descripcion: string;
  costo: number;
  responsable?: string;
}

@Injectable({ providedIn: 'root' })
export class ReparacionService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Reparacion[]> {
    return this.api.get<Reparacion[]>('/reparaciones');
  }

  getByEstado(estado: string): Observable<Reparacion[]> {
    return this.api.get<Reparacion[]>('/reparaciones', { estado });
  }

  getByReserva(idReserva: number): Observable<Reparacion[]> {
    return this.api.get<Reparacion[]>('/reparaciones', { idReserva });
  }

  getCatalogo(): Observable<CatalogoReparacion[]> {
    return this.api.get<CatalogoReparacion[]>('/catalogo-reparaciones');
  }

  create(data: ReparacionFormData): Observable<Reparacion> {
    return this.api.post<Reparacion>('/reparaciones', data);
  }

  updateEstado(id: number, estado: string): Observable<Reparacion> {
    return this.api.patch<Reparacion>('/reparaciones', id, { estado });
  }
}
