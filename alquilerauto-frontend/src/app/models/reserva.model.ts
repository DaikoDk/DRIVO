import { Cliente } from './cliente.model';
import { Auto } from './auto.model';

export interface Reserva {
  idReserva: number;
  cliente: Cliente;
  auto: Auto;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  kilometrajeInicio?: number;
  kilometrajeFin?: number;
  subtotal: number;
  mora: number;
  costoReparaciones: number;
  total: number;
  estado: string;
  estadoEntrega: string;
  observacionesEntrega?: string;
  fechaHoraInicioReal?: string;
  fechaHoraFinReal?: string;
  fechaCreacion: string;
  usuarioCreacion?: string;
  fechaFinalizacion?: string;
  usuarioFinalizacion?: string;
}
