import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Auto } from '../../models';

export interface AutoFormData {
  placa: string;
  idMarca: number;
  idModelo: number;
  anio: number;
  color?: string;
  numeroMotor?: string;
  numeroChasis?: string;
  kilometrajeActual: number;
  precioPorDia: number;
  precioPorHora?: number;
  moraPorDia: number;
  estado?: string;
}

@Injectable({ providedIn: 'root' })
export class AutoService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Auto[]> {
    return this.api.get<Auto[]>('/autos');
  }

  getActivos(): Observable<Auto[]> {
    return this.api.get<Auto[]>('/autos/activos');
  }

  getDisponibles(): Observable<Auto[]> {
    return this.api.get<Auto[]>('/autos/disponibles');
  }

  getDisponiblesEnRango(fechaInicio: string, fechaFin: string): Observable<Auto[]> {
    return this.api.get<Auto[]>('/autos/disponibles-rango', { fechaInicio, fechaFin });
  }

  getById(id: number): Observable<Auto> {
    return this.api.getById<Auto>('/autos', id);
  }

  create(data: AutoFormData): Observable<Auto> {
    return this.api.post<Auto>('/autos', data);
  }

  update(id: number, data: AutoFormData): Observable<Auto> {
    return this.api.put<Auto>('/autos', id, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>('/autos', id);
  }
}
