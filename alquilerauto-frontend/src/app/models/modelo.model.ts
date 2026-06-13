export interface Modelo {
  idModelo: number;
  idMarca: number;
  marca: string;
  nombre: string;
  categoria?: string;
  numeroPasajeros: number;
  activo: boolean;
  fechaRegistro: string;
}
