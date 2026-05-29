import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Mantenimiento } from '../../models';

export interface MantenimientoFormData {
  idAuto: number;
  fechaIngreso: string;
  tipo: string;
  costo: number;
  detalle?: string;
}

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Mantenimiento[]> {
    return this.api.get<Mantenimiento[]>('/mantenimientos');
  }

  getEnCurso(): Observable<Mantenimiento[]> {
    return this.api.get<Mantenimiento[]>('/mantenimientos/en-curso');
  }

  getByAuto(idAuto: number): Observable<Mantenimiento[]> {
    return this.api.get<Mantenimiento[]>('/mantenimientos', { idAuto });
  }

  create(data: MantenimientoFormData): Observable<Mantenimiento> {
    return this.api.post<Mantenimiento>('/mantenimientos', data);
  }

  finalizar(id: number, fechaSalida: string): Observable<Mantenimiento> {
    return this.api.patch<Mantenimiento>('/mantenimientos', id, { fechaSalida });
  }
}
