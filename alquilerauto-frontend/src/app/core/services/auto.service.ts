import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  fotoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AutoService {
  constructor(private readonly api: ApiService, private readonly http: HttpClient) {}

  private readonly baseUrl = 'http://localhost:8080/api';
  private readonly storageUrl = 'http://localhost:8080';

  fotoCompleta(fotoUrl?: string | null): string | null {
    if (!fotoUrl) return null;
    if (fotoUrl.startsWith('http')) return fotoUrl;
    return this.storageUrl + fotoUrl;
  }

  subirFoto(id: number, archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<any>(`${this.baseUrl}/autos/${id}/foto`, formData).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as string)
    );
  }

  definirFotoUrl(id: number, url: string): Observable<string> {
    return this.http.put<any>(`${this.baseUrl}/autos/${id}/foto-url`, { url }).pipe(
      map((res: any) => (res && res.data !== undefined ? res.data : res) as string)
    );
  }

  getAll(): Observable<Auto[]> {
    return this.api.get<Auto[]>('/autos');
  }

  getActivos(): Observable<Auto[]> {
    return this.api.get<Auto[]>('/autos');
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

  hold(idAuto: number): Observable<{ fechaExpiracion: string }> {
    return this.api.post<{ fechaExpiracion: string }>(`/autos/${idAuto}/hold`, {});
  }

  cancelHold(idAuto: number): Observable<void> {
    return this.api.post<void>(`/autos/${idAuto}/hold/cancel`, {});
  }
}
