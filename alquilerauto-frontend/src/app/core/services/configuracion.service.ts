import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Configuracion } from '../../models';

export interface ConfiguracionFormData {
  clave: string;
  valor: string;
  descripcion?: string;
  tipo?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Configuracion[]> {
    return this.api.get<Configuracion[]>('/configuraciones');
  }

  getByClave(clave: string): Observable<Configuracion> {
    return this.api.get<Configuracion>('/configuraciones', { clave });
  }

  create(data: ConfiguracionFormData): Observable<Configuracion> {
    return this.api.post<Configuracion>('/configuraciones', data);
  }

  update(id: number, data: ConfiguracionFormData): Observable<Configuracion> {
    return this.api.put<Configuracion>('/configuraciones', id, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>('/configuraciones', id);
  }
}
