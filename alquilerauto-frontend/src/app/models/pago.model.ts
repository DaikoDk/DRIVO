import { Reserva } from './reserva.model';

export interface Pago {
  idPago: number;
  reserva: Reserva;
  montoBase: number;
  montoMora: number;
  montoDanos: number;
  montoTotalPagado: number;
  fechaPago: string;
  metodoPago: string;
}
