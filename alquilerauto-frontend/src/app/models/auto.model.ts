import { Marca } from './marca.model';
import { Modelo } from './modelo.model';

export interface Auto {
  idAuto: number;
  placa: string;
  marca: Marca;
  modelo: Modelo;
  anio: number;
  color?: string;
  numeroMotor?: string;
  numeroChasis?: string;
  kilometrajeActual: number;
  ultimaRevisionKm?: number;
  proximaRevisionKm?: number;
  precioPorDia: number;
  precioPorHora?: number;
  moraPorDia: number;
  estado: string;
  activo: boolean;
  fechaRegistro: string;
  fechaUltimaActualizacion?: string;
}
