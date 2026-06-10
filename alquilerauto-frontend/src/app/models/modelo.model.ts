import { Marca } from './marca.model';

export interface Modelo {
  idModelo: number;
  marca: Marca;
  nombre: string;
  categoria?: string;
  numeroPasajeros: number;
  activo: boolean;
  fechaRegistro: string;
}
