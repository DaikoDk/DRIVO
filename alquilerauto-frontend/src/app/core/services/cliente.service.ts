import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Cliente } from '../../models';

export interface ClienteFormData {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  dni: string;
  telefono?: string;
  email: string;
  direccion?: string;
  numeroLicencia?: string;
  categoriaLicencia?: string;
  fechaVencimientoLicencia?: string;
}

export interface ClienteMeUpdateData {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  direccion?: string;
  numeroLicencia?: string;
  categoriaLicencia?: string;
  fechaVencimientoLicencia?: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>('/clientes');
  }

  getActivos(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>('/clientes');
  }

  getById(id: number): Observable<Cliente> {
    return this.api.getById<Cliente>('/clientes', id);
  }

  create(data: ClienteFormData): Observable<Cliente> {
    return this.api.post<Cliente>('/clientes', data);
  }

  update(id: number, data: Partial<ClienteFormData>): Observable<Cliente> {
    return this.api.put<Cliente>('/clientes', id, data);
  }

  bloquear(id: number): Observable<Cliente> {
    return this.api.patchCustom<Cliente>(`/clientes/${id}/bloquear`);
  }

  desbloquear(id: number): Observable<Cliente> {
    return this.api.patchCustom<Cliente>(`/clientes/${id}/desbloquear`);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>('/clientes', id);
  }

  getMe(): Observable<Cliente> {
    return this.api.get<Cliente>('/clientes/me');
  }

  updateMe(data: ClienteMeUpdateData): Observable<Cliente> {
    return this.api.putCustom<Cliente>('/clientes/me', data);
  }
}
