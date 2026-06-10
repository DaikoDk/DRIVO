import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Pago } from '../../models';

export interface PagoFormData {
  idReserva: number;
  montoBase: number;
  montoMora: number;
  montoDanos: number;
  metodoPago: string;
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Pago[]> {
    return this.api.get<Pago[]>('/pagos');
  }

  getByReserva(idReserva: number): Observable<Pago[]> {
    return this.api.get<Pago[]>('/pagos', { idReserva });
  }

  register(data: PagoFormData): Observable<Pago> {
    return this.api.post<Pago>('/pagos', data);
  }
}
