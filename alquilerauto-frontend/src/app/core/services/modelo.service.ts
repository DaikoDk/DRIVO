import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Modelo } from '../../models';

@Injectable({ providedIn: 'root' })
export class ModeloService {
  constructor(private readonly api: ApiService) {}

  getByMarca(idMarca: number): Observable<Modelo[]> {
    return this.api.get<Modelo[]>('/modelos', { idMarca });
  }

  getAll(): Observable<Modelo[]> {
    return this.api.get<Modelo[]>('/modelos');
  }
}
