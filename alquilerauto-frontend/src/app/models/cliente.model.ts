import { Licencia } from './licencia.model';

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  dni: string;
  telefono?: string;
  email: string;
  direccion?: string;
  licencia?: Licencia;
  numeroReservas: number;
  numeroIncidentes: number;
  bloqueado: boolean;
  estado: string;
  activo: boolean;
  fechaRegistro: string;
}
