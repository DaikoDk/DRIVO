export interface Auto {
  idAuto: number;
  placa: string;
  marca: string;
  modelo: string;
  categoria?: string;
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
  pasajeros?: number;
  fotoUrl?: string;
  estado: string;
  activo?: boolean;
  fechaRegistro?: string;
  fechaUltimaActualizacion?: string;
}
