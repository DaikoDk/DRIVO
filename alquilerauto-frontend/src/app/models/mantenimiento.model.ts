import { Auto } from './auto.model';

export interface Mantenimiento {
  idMantenimiento: number;
  auto: Auto;
  fechaIngreso: string;
  fechaSalida?: string;
  tipo: string;
  costo: number;
  detalle?: string;
}
