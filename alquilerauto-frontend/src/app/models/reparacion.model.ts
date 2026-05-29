import { Reserva } from './reserva.model';
import { Auto } from './auto.model';
import { CatalogoReparacion } from './catalogo-reparacion.model';

export interface Reparacion {
  idReparacion: number;
  reserva: Reserva;
  auto: Auto;
  catalogoReparacion?: CatalogoReparacion;
  descripcion: string;
  costo: number;
  estado: string;
  responsable?: string;
  fechaReporte: string;
  fechaInicio?: string;
  fechaFin?: string;
  usuarioReporte?: string;
}
