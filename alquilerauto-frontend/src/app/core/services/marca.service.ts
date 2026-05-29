import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Marca } from '../../models';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  constructor(private readonly api: ApiService) {}

  getActivos(): Observable<Marca[]> {
    return this.api.get<Marca[]>('/marcas/activos');
  }

  getAll(): Observable<Marca[]> {
    return this.api.get<Marca[]>('/marcas');
  }
}
